import type { ManualMemberDependencies, ManualMemberIdentity, ManualMemberInput } from '../../../lib/manual-members'

type PreviewMember = ManualMemberInput & { id: string }
// Deliberately isolated from db.ts, Clerk, and the production application.
// This local test process resets all mock records when it restarts.
const previewGlobal = globalThis as typeof globalThis & {
  manualMemberPreview?: { members: Map<string, PreviewMember>; identities: Map<string, ManualMemberIdentity> }
}
export const store = previewGlobal.manualMemberPreview ??= { members: new Map(), identities: new Map() }

export const previewDependencies: ManualMemberDependencies = {
  async findMember(email) {
    const existing = store.members.get(email)
    return existing ? { kind: 'active', id: existing.id } : null
  },
  async findIdentity(email) { return store.identities.get(email) ?? null },
  async createIdentity(email) {
    const identity = { id: `mock_${crypto.randomUUID()}`, primaryEmail: email, name: null }
    store.identities.set(email, identity)
    return identity
  },
  async saveMember(identity, input) { store.members.set(input.email, { ...input, id: identity.id }) },
}
