// Enums
export type Status = 'active' | 'suspended'
export type ResourceType = 'video' | 'image' | 'pdf' | 'docx'
export type OrderStatus = 'pending' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'completed' | 'failed'
export type PaymentMethod = 'credit_card' | 'paypal' | 'transfer' | 'cash'

// Base Types
export interface User {
  id: string
  provider?: string
  provider_id?: string
  email: string
  name?: string
  avatar_url?: string
  created_at?: Date
  last_login?: Date
  role?: string
  status?: Status
  updated_at?: Date
}

export interface Product {
  id: string
  name: string
  description?: string
  price?: number
  created_at?: Date
  updated_at?: Date
  isCustomizable?: boolean
  categories?: Category[]
  attributes?: Attribute[]
  resources?: Resource[]
}

export interface Resource {
  id: number
  name?: string
  url?: string
  thumbnail?: string
  watermark?: string
  hosting?: string
  type?: ResourceType
  isBanner?: boolean
}

export interface BaseModel {
  id: number
  status: Status
  createdAt?: Date
  updatedAt?: Date
}

export interface Category extends BaseModel {
  name: string
  description: string
  color: string
}

export interface Attribute extends BaseModel {
  name: string
  value: string
  color: string
}

export interface Country {
  id: number
  nombre: string
}

export interface State {
  id: number
  nombre: string
  country_id: number
}

export interface ShippingAddress {
  id: number
  user_id?: string
  fullname?: string
  phone?: string
  country_id?: number
  state_id?: number
  city?: string
  postal_code?: string
  address_one?: string
  address_two?: string
  current?: boolean
}

// Order Related Types
export interface Order {
  id: string
  user_id?: string
  status?: OrderStatus
  total_amount?: number
  shipping_address_id?: number
  billing_address?: string
  created_at?: Date
  updated_at?: Date
}

export interface OrderProduct {
  id: number
  order_id?: string
  product_id?: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at?: Date
  updated_at?: Date
}

export interface Payment {
  id: string
  order_id?: string
  amount?: number
  provider_payment_id?: string
  method?: PaymentMethod
  status?: PaymentStatus
  image_url?: string
  paid_at?: Date
  created_at?: Date
}

export interface Cart {
  id: string
  user_id?: string
  quantity: number
  price: number
  subtotal: number
  created_at?: Date
  updated_at?: Date
  products?: Product[]
}
