import type { Product } from '@/types'

export interface ApiCountry { id?: number; nombre?: string }
export interface ApiState { id?: number; nombre?: string }
export interface ApiShippingAddress {
  id?: number
  fullname?: string
  phone?: string
  country?: ApiCountry
  state?: ApiState
  city?: string
  postalCode?: string
  addressOne?: string
  addressTwo?: string
  current?: boolean
}

export interface ApiOrderProduct {
  id: number
  quantity: number
  unitPrice: number
  subtotal: number
  createdAt?: string
  updatedAt?: string
  product?: Product
}

export interface ApiPayment {
  id: string
  amount: number
  providerPaymentId?: string
  method: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  imageUrl?: string
  paidAt?: string | null
  createdAt?: string
}

export interface ApiOrder {
  id: string
  status: 'PENDING' | 'DELIVERED' | 'CANCELLED'
  totalAmount: number
  shippingAddress: ApiShippingAddress
  billingAddress?: string
  createdAt: string
  updatedAt?: string
  orderProducts: ApiOrderProduct[]
  payments: ApiPayment[]
}
