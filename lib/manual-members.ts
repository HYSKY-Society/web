import { isDirectoryAdmin } from './admin'

export class ManualMemberError extends Error {}

export type ManualMemberInput = { email: string; name: string; tier: string }
export type AddMemberState = { error?: string; message?: string; href?: string }
export type ManualMemberIdentity = { id: string; primaryEmail: string; name: string | null }
export type ManualMemberDependencies = {
  findMember(email: string): Promise<{ kind: 'active' | 'pending'; id: string } | null>
  findIdentity(email: string): Promise<ManualMemberIdentity | null>
  createIdentity(email: string): Promise<ManualMemberIdentity>
  saveMember(identity: ManualMemberIdentity, input: ManualMemberInput): Promise<void>
}

// The caller supplies the authenticated primary email, never a form field.
export async function addManualMember(
  actorEmail: string,
  input: ManualMemberInput,
  dependencies: ManualMemberDependencies,
) {
  if (!isDirectoryAdmin(actorEmail)) throw new Error('Forbidden')
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ManualMemberError('Enter a valid email address.')
  }
  if (name.length > 150) throw new ManualMemberError('Name must be 150 characters or fewer.')
  if (!['free', 'member_full'].includes(input.tier)) {
    throw new ManualMemberError('Choose a valid membership level.')
  }

  // Avoid any Clerk call for a person already in the Connect directory.
  const existing = await dependencies.findMember(email)
  if (existing) return { ...existing, existing: true }

  // Reuse a Clerk identity after a partial failure; never create duplicates.
  const identity = await dependencies.findIdentity(email) ?? await dependencies.createIdentity(email)
  if (identity.primaryEmail.toLowerCase().trim() !== email) {
    throw new ManualMemberError('This is a secondary Clerk email. Add the member using their primary sign-in email.')
  }
  await dependencies.saveMember(identity, { email, name, tier: input.tier })
  return { kind: 'active' as const, id: identity.id, existing: false }
}
