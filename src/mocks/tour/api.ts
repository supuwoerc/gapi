import type { PatchTourParams, PatchTourResponse } from '@/service/users/dto/users'

export async function patchTour(params: PatchTourParams): Promise<PatchTourResponse> {
  await new Promise((r) => setTimeout(r, 300))
  return { completed_tours: params.completed_tours }
}
