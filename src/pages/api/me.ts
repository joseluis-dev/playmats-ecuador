import type { APIRoute } from 'astro'
import { userService } from '@/services/userService'

// In-memory cache per userId (small TTL) - safe on single instance / ephemeral runtime
interface UserCacheEntry { user: any; expiry: number }
const userCache = new Map<string, UserCacheEntry>()
const USER_TTL = 30_000 // 30s

export const GET: APIRoute = async ({ locals }) => {
  try {
    const current = await locals.currentUser()
    if (!current?.id) {
      return new Response(JSON.stringify({ user: null }), { status: 200 })
    }

    const cached = userCache.get(current.id)
    const now = Date.now()
    if (cached && cached.expiry > now) {
      return new Response(JSON.stringify({ user: cached.user }), { status: 200, headers: { 'X-Cache': 'HIT' } })
    }

    const users = await userService.getUserByProviderId(current.id)
    const user = users && users.length > 0 ? users[0] : null
    userCache.set(current.id, { user, expiry: now + USER_TTL })
    return new Response(JSON.stringify({ user }), { status: 200, headers: { 'X-Cache': 'MISS' } })
  } catch (error) {
    return new Response(JSON.stringify({ user: null }), { status: 200 })
  }
}
