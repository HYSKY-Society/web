const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

// Compile only the pure provisioning logic; no Next server or cloud SDK runs.
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename)
const { addManualMember } = require('../lib/manual-members.ts')

function fixture() {
  const members = new Map(), identities = new Map(), calls = []
  const dependencies = {
    async findMember(email) { calls.push('findMember'); return members.get(email) ?? null },
    async findIdentity(email) { calls.push('findIdentity'); return identities.get(email) ?? null },
    async createIdentity(email) {
      calls.push('createIdentity')
      const user = { id: 'clerk_test', primaryEmail: email, name: null }
      identities.set(email, user)
      return user
    },
    async saveMember(identity, input) { calls.push('saveMember'); members.set(input.email, { kind: 'active', id: identity.id, ...input }) },
  }
  return { members, identities, calls, dependencies }
}
const input = { email: ' Buyer@Example.com ', name: ' Buyer ', tier: 'free' }

test('only Danielle can add members; reject other admins before any I/O', async () => {
  for (const email of ['', 'r@hy-sky.net', 'buyer@example.com']) {
    const f = fixture()
    await assert.rejects(addManualMember(email, input, f.dependencies), /Forbidden/)
    assert.deepEqual(f.calls, [])
  }
})
test('reject malformed email and forged tier before any I/O', async () => {
  for (const bad of [{ ...input, email: 'invalid' }, { ...input, tier: 'admin' }, { ...input, tier: 'member_courses' }, { ...input, tier: 'member_courses_events' }, { ...input, name: 'a'.repeat(151) }]) {
    const f = fixture()
    await assert.rejects(addManualMember('d@hy-sky.net', bad, f.dependencies))
    assert.deepEqual(f.calls, [])
  }
})
test('create normalized Free member and Clerk identity on explicit submission', async () => {
  const f = fixture()
  const result = await addManualMember('d@hy-sky.net', input, f.dependencies)
  assert.equal(result.existing, false)
  assert.equal(f.members.get('buyer@example.com').tier, 'free')
  assert.equal(f.members.get('buyer@example.com').name, 'Buyer')
  assert.deepEqual(f.calls, ['findMember', 'findIdentity', 'createIdentity', 'saveMember'])
})
test('save VIP selection and preserve it on duplicate submission', async () => {
  const f = fixture()
  await addManualMember('d@hy-sky.net', { ...input, tier: 'member_full' }, f.dependencies)
  f.calls.length = 0
  assert.equal((await addManualMember('d@hy-sky.net', input, f.dependencies)).existing, true)
  assert.equal(f.members.get('buyer@example.com').tier, 'member_full')
  assert.deepEqual(f.calls, ['findMember'])
})
test('existing pending member is returned for editing without any Clerk call', async () => {
  const f = fixture()
  f.members.set('buyer@example.com', { kind: 'pending', id: 'buyer@example.com' })
  assert.equal((await addManualMember('d@hy-sky.net', input, f.dependencies)).kind, 'pending')
  assert.deepEqual(f.calls, ['findMember'])
})
test('retry after database failure reuses the already created Clerk identity', async () => {
  const f = fixture(), save = f.dependencies.saveMember
  f.dependencies.saveMember = async () => { throw new Error('Database temporarily unavailable') }
  await assert.rejects(addManualMember('d@hy-sky.net', input, f.dependencies), /temporarily unavailable/)
  f.dependencies.saveMember = save
  await addManualMember('d@hy-sky.net', input, f.dependencies)
  assert.equal(f.calls.filter(x => x === 'createIdentity').length, 1)
  assert.equal(f.members.size, 1)
})
test('Clerk failure does not create a misleading Connect record', async () => {
  const f = fixture()
  f.dependencies.createIdentity = async () => { throw new Error('Clerk unavailable') }
  await assert.rejects(addManualMember('d@hy-sky.net', input, f.dependencies), /Clerk unavailable/)
  assert.equal(f.members.size, 0)
})
test('secondary email cannot create a mismatched local identity', async () => {
  const f = fixture()
  f.identities.set('buyer@example.com', { id: 'existing', primaryEmail: 'primary@example.com', name: null })
  await assert.rejects(addManualMember('d@hy-sky.net', input, f.dependencies), /primary sign-in email/)
  assert.equal(f.members.size, 0)
})
