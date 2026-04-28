import { getUsers as _getUsers } from '@/mocks/users/api'
import { userListSchema } from '@/schema/admin/users'

import type { GetUsersParams } from './dto/users'

// import { userListSchema } from '@/schema/admin/users'
// import { client } from '@/lib/ky' // 你封装的 ky 实例

// import type { GetUsersParams, GetUsersResponse } from './dto/users'

// export async function getUsers(params: GetUsersParams) {
//   const res = await client.get('users', { searchParams: params }).json<GetUsersResponse>()
//   return { ...res, data: userListSchema.parse(res.data) }
// }

export async function getUsers(params: GetUsersParams) {
  const res = await _getUsers(params)
  return { ...res, data: userListSchema.parse(res.data) }
}
