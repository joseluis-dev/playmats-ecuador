import { api } from './api'
import type { PaymentMethod } from '@/types'
import type { ApiPayment } from '@/types/api-order'

// Endpoints según convención usada en orderService
// - Subrecurso: /orders/{orderId}/payments
// - Evidencia:  /orders/{orderId}/payments/proof (multipart)
// - Listado admin (opcional): /payments?status=&method=&order=&user=&from=&to=

const ORDERS_ENDPOINT = 'orders'
const PAYMENTS_ENDPOINT = 'payments'

export type PaymentStatusApi = ApiPayment['status'] | 'PENDING' | 'COMPLETED' | 'FAILED' | 'APPROVED' | 'REJECTED'

export interface CreatePaymentParams {
  amount: number
  method: PaymentMethod | string
  providerPaymentId?: string
  imageUrl?: string
}

export interface PaymentFilters {
  status?: PaymentStatusApi
  method?: PaymentMethod | string
  order?: string
  user?: string
  from?: string // ISO date
  to?: string   // ISO date
}

function toQuery(params?: Record<string, any>) {
  if (!params) return ''
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    q.set(k, String(v))
  })
  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export const paymentService = {
  // Admin: listar todos los pagos con filtros opcionales
  list: async (filters?: PaymentFilters): Promise<ApiPayment[]> => {
    return await api.get<ApiPayment[]>(`${PAYMENTS_ENDPOINT}${toQuery(filters)}`)
  },

  // Obtener un pago (top-level)
  get: async (paymentId: string): Promise<ApiPayment> => {
    return await api.get<ApiPayment>(`${PAYMENTS_ENDPOINT}/${paymentId}`)
  },

  // Listar pagos de una orden
  listByOrder: async (orderId: string): Promise<ApiPayment[]> => {
    return await api.get<ApiPayment[]>(`${ORDERS_ENDPOINT}/${orderId}/payments`)
  },

  // Actualizar estado de un pago de una orden
  update: async (paymentId: string, payment: ApiPayment): Promise<ApiPayment> => {
    return await api.patch<ApiPayment>(`${PAYMENTS_ENDPOINT}/${paymentId}`, payment)
  },

  // Eliminar un pago (si el backend lo permite)
  delete: async (paymentId: string): Promise<boolean> => {
    return await api.delete(`${PAYMENTS_ENDPOINT}/${paymentId}`)
  },
}

export type { ApiPayment }
