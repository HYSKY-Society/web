import { getUserTier } from './members'

/** Returns true if the user's tier allows access to gated content. */
export async function hasPaidAccess(clerkId: string): Promise<boolean> {
  const tier = await getUserTier(clerkId)
  return tier === 'paid'
}
