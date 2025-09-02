import type { APIRoute } from 'astro'
import { userService } from '@/services/userService'

export const GET: APIRoute = async ({ locals }) => {
  try {
    const current = await locals.currentUser()
    if (!current?.id) {
      return new Response(JSON.stringify({ user: null }), { status: 200 })
    }
    const users = await userService.getUserByProviderId(current.id)
    const user = users && users.length > 0 ? users[0] : null
    return new Response(JSON.stringify({ user }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ user: null }), { status: 200 })
  }
}
