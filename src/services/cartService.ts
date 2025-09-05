import { api } from './api'
import type { Cart, CartProduct } from '@/types'

// Asumimos convención REST similar a otros recursos del backend
// Si en tu Postman el path difiere (p. ej. "cart" o "cart-items"), ajusta CARTS_ENDPOINT
const CARTS_ENDPOINT = 'carts'

export const cartService = {
  /**
   * Obtiene los items del carrito de un usuario
   * GET /carts?user={userId}
   */
  listByUser: async (userId: string): Promise<Cart[]> => {
    return await api.get<Cart[]>(`${CARTS_ENDPOINT}?user=${userId}`)
  },

  /**
   * Agrega un producto al carrito del usuario
   * POST /carts
   * Body esperado (según estilo del backend):
   * { user: { id }, product: { id }, quantity }
   */
  create: async (
    params: Cart
  ): Promise<Cart> => {
    return await api.post<Cart>(`${CARTS_ENDPOINT}`, params)
  },

  /**
   * Actualiza la cantidad de un item del carrito
   * PATCH /carts/{id}
   */
  update: async (cart: Cart, cartId: string | number): Promise<Cart> => {
    return await api.patch<Cart>(`${CARTS_ENDPOINT}/${cartId}`, cart)
  },

  /**
   * Elimina un item del carrito
   * DELETE /carts/{id}
   */
  delete: async (id: string | number): Promise<boolean> => {
    return await api.delete(`${CARTS_ENDPOINT}/${id}`)
  },

  /**
   * Vacía el carrito del usuario
   * DELETE /carts?user={userId}
   * Si tu API usa otro path (p.ej. /carts/clear?user=), ajusta aquí
   */
  clearByUser: async (userId: string): Promise<boolean> => {
    return await api.delete(`${CARTS_ENDPOINT}?user=${userId}`)
  },
}
