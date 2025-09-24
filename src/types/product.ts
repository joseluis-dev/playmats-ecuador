/**
 * Tipos específicos para el servicio de productos
 * Estos tipos complementan los tipos base definidos en /types/index.ts
 */

export interface ProductFilters {
  page?: number
  limit?: number
  name?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  isCustomizable?: boolean
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  isCustomizable: boolean
}

export interface ProductUpdateData extends Partial<ProductFormData> {}

export interface ProductCategoryAssignment {
  categoryIds: string[]
}

export interface ProductAttributeAssignment {
  attributeIds: string[]
}

export interface ProductResourceAssignment {
  resourceIds: string[]
}

export interface ProductResourceUpload {
  files: File[]
  isBanner?: boolean[]
  descriptions?: string[]
}

export interface ProductSearchCriteria {
  query?: string
  categoryId?: string
  attributeIds?: string[]
  priceRange?: {
    min: number
    max: number
  }
  customizableOnly?: boolean
}

export interface ProductBulkOperation {
  productIds: string[]
  operation: 'delete' | 'activate' | 'deactivate' | 'updateCategory' | 'updatePrice'
  data?: any
}

export interface ProductStats {
  totalProducts: number
  customizableProducts: number
  averagePrice: number
  categoriesCount: number
  attributesCount: number
  resourcesCount: number
}

// Tipos de respuesta del API
export interface ProductResponse {
  success: boolean
  data: any
  message?: string
  errors?: string[]
}

export interface ProductListResponse {
  products: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Tipos para validación
export interface ProductValidation {
  isValid: boolean
  errors: {
    field: string
    message: string
  }[]
}

// Enums específicos para productos
export enum ProductSortOptions {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  DATE_ASC = 'date_asc',
  DATE_DESC = 'date_desc'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED'
}

// Tipos para manejo de errores específicos de productos
export interface ProductError extends Error {
  code?: string
  details?: any
}

export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Producto con ID ${productId} no encontrado`)
    this.name = 'ProductNotFoundError'
  }
}

export class ProductValidationError extends Error {
  public validationErrors: { field: string; message: string }[]
  
  constructor(errors: { field: string; message: string }[]) {
    super('Error de validación en los datos del producto')
    this.name = 'ProductValidationError'
    this.validationErrors = errors
  }
}

export class ProductUploadError extends Error {
  constructor(message: string, public details?: any) {
    super(`Error al subir recursos del producto: ${message}`)
    this.name = 'ProductUploadError'
  }
}