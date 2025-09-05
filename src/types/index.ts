// Enums
export type Status = 'ACTIVE' | 'SUSPENDED'
export type ResourceType = 'VIDEO' | 'IMAGE' | 'PDF' | 'DOCX'
export type OrderStatus = 'PENDING' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED'
export type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'TRANSFER' | 'CASH'

// Base Types
export interface User {
  id?: string
  provider?: string
  providerId?: string
  email?: string
  name?: string
  avatarUrl?: string
  createdAt?: Date
  lastLogin?: Date
  role?: string
  status?: Status
  updatedAt?: Date
}

export interface Product {
  id: string
  name?: string
  description?: string
  price?: number
  created_at?: Date
  updated_at?: Date
  isCustomizable?: boolean
  categories?: Category[]
  attributes?: Attribute[]
  resourceProducts?: ResourceProduct[]
}

export interface ResourceProduct {
  id: number
  resource: Resource
  isBanner: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Resource {
  id: number | string
  name?: string
  url?: string
  thumbnail?: string
  watermark?: string
  hosting?: string
  type?: ResourceType
  file?: File
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
  id?: number
  nombre?: string
}

export interface State {
  id?: number
  nombre?: string
  country_id?: number
}

export interface ShippingAddress {
  id?: number
  user?: User
  fullname?: string
  phone?: string
  country?: Country
  state?: State
  city?: string
  postalCode?: string
  addressOne?: string
  addressTwo?: string
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

export interface CartProduct {
  id?: number
  product: Product
  quantity: number
  price?: number
  subtotal?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Cart {
  id?: string
  user?: User
  cartProducts?: CartProduct[]
  total?: number
  createdAt?: Date
  updatedAt?: Date
}
