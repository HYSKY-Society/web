'use server'

import { revalidatePath } from 'next/cache'
import { addManualMember, type AddMemberState } from '../../../lib/manual-members'
import { previewDependencies } from './store'

export async function addPreviewMember(_state: AddMemberState, formData: FormData): Promise<AddMemberState> {
  if (process.env.NODE_ENV !== 'development') throw new Error('Local preview only')
  try {
    const result = await addManualMember('d@hy-sky.net', {
      email: String(formData.get('email') ?? ''),
      name: String(formData.get('name') ?? ''),
      tier: String(formData.get('tier') ?? ''),
    }, previewDependencies)
    revalidatePath('/')
    return { message: result.existing ? 'Already exists. No duplicate or membership change.' : 'Added to the local member list and mock Clerk. No cloud calls.' }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not add test member.' }
  }
}
