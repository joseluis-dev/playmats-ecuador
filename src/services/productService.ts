import { api } from './api'
import type { Product, Category, Attribute, Resource } from '@/types'
import type {
  ProductFilters,
  ProductFormData,
  ProductUpdateData,
  ProductCategoryAssignment,
  ProductAttributeAssignment,
  ProductResourceUpload,
  ProductSearchCriteria,
  ProductBulkOperation,
  ProductStats,
  ProductResponse,
  ProductListResponse,
  ProductResourceAssignment
} from '@/types/product'
import {
  ProductNotFoundError,
  ProductValidationError,
  ProductUploadError
} from '@/types/product'

const PRODUCTS_ENDPOINT = 'products'

// Interfaces específicas para compatibilidad con el API
export interface CreateProductRequest extends ProductFormData {
  createdAt?: null
  updatedAt?: null
}

export interface UpdateProductRequest extends ProductUpdateData {
  id?: never // Evita incluir el ID en el body de actualización
}

// Alias para compatibilidad con el código existente
export type ProductQueryParams = ProductFilters
export type AssignCategoriesRequest = ProductCategoryAssignment
export type AssignAttributesRequest = ProductAttributeAssignment
export type ProductResourcesUploadData = ProductResourceUpload

export const productService = {
  /**
   * Obtiene la lista de productos con parámetros de consulta opcionales
   * GET /products?{queryParams}
   */
  list: async (params?: ProductQueryParams): Promise<Product[]> => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString())
          }
        })
      }

      const queryString = queryParams.toString()
      const endpoint = queryString ? `${PRODUCTS_ENDPOINT}?${queryString}` : PRODUCTS_ENDPOINT
      
      return await api.get<Product[]>(endpoint)
    } catch (error) {
      console.error('Error al obtener la lista de productos:', error)
      throw new Error('No se pudieron cargar los productos')
    }
  },

  /**
   * Obtiene un producto por su ID
   * GET /products/{id}
   */
  getById: async (id: string): Promise<Product> => {
    try {
      if (!id) {
        throw new ProductValidationError([{ field: 'id', message: 'El ID del producto es requerido' }])
      }

      return await api.get<Product>(`${PRODUCTS_ENDPOINT}/${id}`)
    } catch (error) {
      console.error(`Error al obtener el producto ${id}:`, error)
      
      if (error instanceof ProductValidationError) {
        throw error
      }
      
      throw new ProductNotFoundError(id)
    }
  },

  /**
   * Crea un nuevo producto
   * POST /products
   */
  create: async (productData: CreateProductRequest): Promise<Product> => {
    try {
      // Validación básica
      const validationErrors = productService.validateProductData(productData)
      if (validationErrors.length > 0) {
        throw new ProductValidationError(validationErrors)
      }

      return await api.post<Product>(PRODUCTS_ENDPOINT, productData)
    } catch (error) {
      console.error('Error al crear el producto:', error)
      
      if (error instanceof ProductValidationError) {
        throw error
      }
      
      throw new Error('No se pudo crear el producto')
    }
  },

  /**
   * Actualiza un producto existente (actualización parcial)
   * PATCH /products/{id}
   */
  update: async (id: string, productData: UpdateProductRequest): Promise<Product> => {
    try {
      if (!id) {
        throw new ProductValidationError([{ field: 'id', message: 'El ID del producto es requerido' }])
      }

      return await api.patch<Product>(`${PRODUCTS_ENDPOINT}/${id}`, productData)
    } catch (error) {
      console.error(`Error al actualizar el producto ${id}:`, error)
      
      if (error instanceof ProductValidationError) {
        throw error
      }
      
      throw new Error('No se pudo actualizar el producto')
    }
  },

  /**
   * Reemplaza completamente un producto existente
   * PUT /products/{id}
   */
  replace: async (id: string, productData: CreateProductRequest): Promise<Product> => {
    try {
      if (!id) {
        throw new ProductValidationError([{ field: 'id', message: 'El ID del producto es requerido' }])
      }

      // Validación completa para PUT
      const validationErrors = productService.validateProductData(productData)
      if (validationErrors.length > 0) {
        throw new ProductValidationError(validationErrors)
      }

      return await api.put<Product>(`${PRODUCTS_ENDPOINT}/${id}`, productData)
    } catch (error) {
      console.error(`Error al reemplazar el producto ${id}:`, error)
      
      if (error instanceof ProductValidationError) {
        throw error
      }
      
      throw new Error('No se pudo reemplazar el producto')
    }
  },

  /**
   * Elimina un producto
   * DELETE /products/{id}
   */
  delete: async (id: string): Promise<boolean> => {
    try {
      if (!id) {
        throw new ProductValidationError([{ field: 'id', message: 'El ID del producto es requerido' }])
      }

      return await api.delete(`${PRODUCTS_ENDPOINT}/${id}`)
    } catch (error) {
      console.error(`Error al eliminar el producto ${id}:`, error)
      
      if (error instanceof ProductValidationError) {
        throw error
      }
      
      throw new Error('No se pudo eliminar el producto')
    }
  },

  // === GESTIÓN DE CATEGORÍAS ===

  /**
   * Obtiene las categorías de un producto
   * GET /products/{id}/categories
   */
  getCategories: async (productId: string): Promise<Category[]> => {
    try {
      if (!productId) {
        throw new ProductValidationError([{ field: 'productId', message: 'El ID del producto es requerido' }])
      }

      return await api.get<Category[]>(`${PRODUCTS_ENDPOINT}/${productId}/categories`)
    } catch (error) {
      console.error(`Error al obtener categorías del producto ${productId}:`, error)
      throw new Error('No se pudieron cargar las categorías del producto')
    }
  },

  /**
   * Asigna categorías a un producto
   * POST /products/{id}/categories
   */
  assignCategories: async (productId: string, categories: AssignCategoriesRequest): Promise<void> => {
    try {
      if (!productId) {
        throw new ProductValidationError([{ field: 'productId', message: 'El ID del producto es requerido' }])
      }

      if (!categories.categoryIds || categories.categoryIds.length === 0) {
        throw new ProductValidationError([{ field: 'categoryIds', message: 'Debe proporcionar al menos una categoría' }])
      }

      await api.post(`${PRODUCTS_ENDPOINT}/${productId}/categories`, categories)
    } catch (error) {
      console.error(`Error al asignar categorías al producto ${productId}:`, error)
      
      if (error instanceof ProductValidationError) {
        throw error
      }
      
      throw new Error('No se pudieron asignar las categorías al producto')
    }
  },

  /**
   * Reemplaza todas las categorías de un producto
   * PUT /products/{id}/categories
   */
  replaceCategories: async (productId: string, categories: AssignCategoriesRequest): Promise<void> => {
    try {
      if (!productId) {
        throw new ProductValidationError([{ field: 'productId', message: 'El ID del producto es requerido' }])
      }

      await api.put(`${PRODUCTS_ENDPOINT}/${productId}/categories`, categories)
    } catch (error) {
      console.error(`Error al reemplazar categorías del producto ${productId}:`, error)
      
      if (error instanceof ProductValidationError) {
        throw error
      }
      
      throw new Error('No se pudieron reemplazar las categorías del producto')
    }
  },

  // === GESTIÓN DE ATRIBUTOS ===

  /**
   * Obtiene los atributos de un producto
   * GET /products/{id}/attributes
   */
  getAttributes: async (productId: string): Promise<Attribute[]> => {
    try {
      if (!productId) {
        throw new ProductValidationError([{ field: 'productId', message: 'El ID del producto es requerido' }])
      }

      return await api.get<Attribute[]>(`${PRODUCTS_ENDPOINT}/${productId}/attributes`)
    } catch (error) {
      console.error(`Error al obtener atributos del producto ${productId}:`, error)
      throw new Error('No se pudieron cargar los atributos del producto')
    }
  },

  /**
   * Asigna atributos a un producto
   * POST /products/{id}/attributes
   */
  assignAttributes: async (productId: string, attributes: AssignAttributesRequest): Promise<void> => {
    try {
      if (!productId) {
        throw new ProductValidationError([{ field: 'productId', message: 'El ID del producto es requerido' }])
      }

      if (!attributes.attributeIds || attributes.attributeIds.length === 0) {
        throw new ProductValidationError([{ field: 'attributeIds', message: 'Debe proporcionar al menos un atributo' }])
      }

      await api.post(`${PRODUCTS_ENDPOINT}/${productId}/attributes`, attributes)
    } catch (error) {
      console.error(`Error al asignar atributos al producto ${productId}:`, error)
      
      if (error instanceof ProductValidationError) {
        throw error
      }
      
      throw new Error('No se pudieron asignar los atributos al producto')
    }
  },

  /**
   * Reemplaza todos los atributos de un producto
   * PUT /products/{id}/attributes
   */
  replaceAttributes: async (productId: string, attributes: AssignAttributesRequest): Promise<void> => {
    try {
      if (!productId) {
        throw new ProductValidationError([{ field: 'productId', message: 'El ID del producto es requerido' }])
      }

      await api.put(`${PRODUCTS_ENDPOINT}/${productId}/attributes`, attributes)
    } catch (error) {
      console.error(`Error al reemplazar atributos del producto ${productId}:`, error)
      
      if (error instanceof ProductValidationError) {
        throw error
      }
      
      throw new Error('No se pudieron reemplazar los atributos del producto')
    }
  },

  // === GESTIÓN DE RECURSOS (IMÁGENES, ARCHIVOS) ===

  /**
   * Obtiene los recursos de un producto
   * GET /products/{id}/resources
   */
  getResources: async (productId: string): Promise<Resource[]> => {
    try {
      if (!productId) {
        throw new ProductValidationError([{ field: 'productId', message: 'El ID del producto es requerido' }])
      }

      return await api.get<Resource[]>(`${PRODUCTS_ENDPOINT}/${productId}/resources`)
    } catch (error) {
      console.error(`Error al obtener recursos del producto ${productId}:`, error)
      throw new Error('No se pudieron cargar los recursos del producto')
    }
  },

  /**
   * Sube recursos (imágenes, archivos) a un producto
   * POST /products/{id}/resources
   */
  uploadResources: async (productId: string, resourceData: ProductResourcesUploadData): Promise<void> => {
    try {
      if (!productId) {
        throw new ProductValidationError([{ field: 'productId', message: 'El ID del producto es requerido' }])
      }

      if (!resourceData.files || resourceData.files.length === 0) {
        throw new ProductUploadError('Debe proporcionar al menos un archivo')
      }

      const formData = new FormData()
      
      // Agrega los archivos al FormData
      resourceData.files.forEach((file: File, index: number) => {
        formData.append('files', file)
        
        // Si se especifica isBanner para este archivo, lo agrega
        if (resourceData.isBanner && resourceData.isBanner[index] !== undefined) {
          formData.append(`isBanner[${index}]`, resourceData.isBanner[index].toString())
        }

        // Si se especifica descripción para este archivo, la agrega
        if (resourceData.descriptions && resourceData.descriptions[index]) {
          formData.append(`descriptions[${index}]`, resourceData.descriptions[index])
        }
      })

      await api.postForm(`${PRODUCTS_ENDPOINT}/${productId}/resources`, formData)
    } catch (error) {
      console.error(`Error al subir recursos al producto ${productId}:`, error)
      
      if (error instanceof ProductValidationError || error instanceof ProductUploadError) {
        throw error
      }
      
      throw new ProductUploadError('No se pudieron subir los recursos al producto')
    }
  },

  uploadResource: async (productId: string, formData: FormData): Promise<any> => {
    try {
      if (!productId) {
        throw new ProductValidationError([{ field: 'productId', message: 'El ID del producto es requerido' }])
      }
      if (!formData) {
        throw new ProductUploadError('Debe proporcionar un archivo')
      }
      return await api.postForm(`${PRODUCTS_ENDPOINT}/${productId}/resources`, formData)
    } catch (error) {
      console.error(`Error al subir recurso al producto ${productId}:`, error)
      if (error instanceof ProductValidationError || error instanceof ProductUploadError) {
        throw error
      }
      throw new ProductUploadError('No se pudo subir el recurso al producto')
    }
  },

  replaceResources: async (productId: string, resources: ProductResourceAssignment): Promise<void> => {
    try {
      if (!productId) {
        throw new ProductValidationError([{ field: 'productId', message: 'El ID del producto es requerido' }])
      }
      if (!resources || resources.resourcesProduct.length === 0) {
        throw new ProductValidationError([{ field: 'resourcesProduct', message: 'Debe proporcionar al menos un ID de recurso' }])
      }
      await api.put(`${PRODUCTS_ENDPOINT}/${productId}/resources`, { resourcesProduct: resources.resourcesProduct })
    } catch (error) {
      console.error(`Error al reemplazar recursos del producto ${productId}:`, error)
      if (error instanceof ProductValidationError) {
        throw error
      }
      throw new Error('No se pudieron reemplazar los recursos del producto')
    }
  },

  // === MÉTODOS DE UTILIDAD ===

  /**
   * Busca productos por nombre (método de conveniencia)
   */
  searchByName: async (name: string): Promise<Product[]> => {
    if (!name || name.trim().length === 0) {
      throw new ProductValidationError([{ field: 'name', message: 'El nombre de búsqueda es requerido' }])
    }

    return await productService.list({ name: name.trim() })
  },

  /**
   * Obtiene productos por categoría (método de conveniencia)
   */
  getByCategory: async (categoryId: string): Promise<Product[]> => {
    if (!categoryId) {
      throw new ProductValidationError([{ field: 'categoryId', message: 'El ID de categoría es requerido' }])
    }

    return await productService.list({ category: categoryId })
  },

  /**
   * Obtiene productos personalizables (método de conveniencia)
   */
  getCustomizable: async (): Promise<Product[]> => {
    return await productService.list({ isCustomizable: true })
  },

  /**
   * Obtiene productos en un rango de precios (método de conveniencia)
   */
  getByPriceRange: async (minPrice: number, maxPrice: number): Promise<Product[]> => {
    if (minPrice < 0 || maxPrice < 0) {
      throw new ProductValidationError([{ field: 'price', message: 'Los precios no pueden ser negativos' }])
    }

    if (minPrice > maxPrice) {
      throw new ProductValidationError([{ field: 'price', message: 'El precio mínimo no puede ser mayor al máximo' }])
    }

    return await productService.list({ minPrice, maxPrice })
  },

  /**
   * Verifica si un producto existe
   */
  exists: async (id: string): Promise<boolean> => {
    try {
      await productService.getById(id)
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * Copia un producto existente (útil para crear variaciones)
   */
  duplicate: async (id: string, newName?: string): Promise<Product> => {
    try {
      const originalProduct = await productService.getById(id)
      
      const duplicateData: CreateProductRequest = {
        name: newName || `${originalProduct.name} (Copia)`,
        description: originalProduct.description || '',
        price: originalProduct.price || 0,
        isCustomizable: originalProduct.isCustomizable || false,
      }

      return await productService.create(duplicateData)
    } catch (error) {
      console.error(`Error al duplicar el producto ${id}:`, error)
      throw new Error(`Error al duplicar el producto: ${error}`)
    }
  },

  /**
   * Búsqueda avanzada de productos
   */
  advancedSearch: async (criteria: ProductSearchCriteria): Promise<Product[]> => {
    try {
      const params: ProductQueryParams = {}

      if (criteria.query) {
        params.name = criteria.query
      }

      if (criteria.categoryId) {
        params.category = criteria.categoryId
      }

      if (criteria.priceRange) {
        params.minPrice = criteria.priceRange.min
        params.maxPrice = criteria.priceRange.max
      }

      if (criteria.customizableOnly !== undefined) {
        params.isCustomizable = criteria.customizableOnly
      }

      return await productService.list(params)
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error)
      throw new Error('No se pudo realizar la búsqueda avanzada')
    }
  },

  /**
   * Obtiene estadísticas de productos
   */
  getStats: async (): Promise<ProductStats> => {
    try {
      const allProducts = await productService.list()
      
      const stats: ProductStats = {
        totalProducts: allProducts.length,
        customizableProducts: allProducts.filter(p => p.isCustomizable).length,
        averagePrice: allProducts.reduce((sum, p) => sum + (p.price || 0), 0) / allProducts.length || 0,
        categoriesCount: 0, // Se puede implementar con un endpoint específico
        attributesCount: 0, // Se puede implementar con un endpoint específico
        resourcesCount: 0   // Se puede implementar con un endpoint específico
      }

      return stats
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      throw new Error('No se pudieron obtener las estadísticas')
    }
  },

  /**
   * Operaciones en lote
   */
  bulkOperation: async (operation: ProductBulkOperation): Promise<void> => {
    try {
      if (!operation.productIds || operation.productIds.length === 0) {
        throw new ProductValidationError([{ field: 'productIds', message: 'Debe proporcionar al menos un ID de producto' }])
      }

      // Implementar según las operaciones disponibles en el API
      switch (operation.operation) {
        case 'delete':
          await Promise.all(operation.productIds.map(id => productService.delete(id)))
          break
        
        case 'updateCategory':
          if (operation.data?.categoryIds) {
            await Promise.all(
              operation.productIds.map(id => 
                productService.replaceCategories(id, { categoryIds: operation.data.categoryIds })
              )
            )
          }
          break

        case 'updatePrice':
          if (operation.data?.price) {
            await Promise.all(
              operation.productIds.map(id => 
                productService.update(id, { price: operation.data.price })
              )
            )
          }
          break

        default:
          throw new ProductValidationError([{ field: 'operation', message: 'Operación no válida' }])
      }
    } catch (error) {
      console.error('Error en operación en lote:', error)
      
      if (error instanceof ProductValidationError) {
        throw error
      }
      
      throw new Error('No se pudo completar la operación en lote')
    }
  },

  /**
   * Validación de datos del producto
   */
  validateProductData: (data: Partial<ProductFormData>): { field: string; message: string }[] => {
    const errors: { field: string; message: string }[] = []

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push({ field: 'name', message: 'El nombre del producto es requerido' })
      } else if (data.name.length > 255) {
        errors.push({ field: 'name', message: 'El nombre del producto no puede exceder 255 caracteres' })
      }
    }

    if (data.description !== undefined) {
      if (!data.description || data.description.trim().length === 0) {
        errors.push({ field: 'description', message: 'La descripción del producto es requerida' })
      } else if (data.description.length > 1000) {
        errors.push({ field: 'description', message: 'La descripción no puede exceder 1000 caracteres' })
      }
    }

    if (data.price !== undefined) {
      if (data.price === null || data.price === undefined) {
        errors.push({ field: 'price', message: 'El precio del producto es requerido' })
      } else if (data.price < 0) {
        errors.push({ field: 'price', message: 'El precio no puede ser negativo' })
      } else if (data.price > 999999.99) {
        errors.push({ field: 'price', message: 'El precio no puede exceder 999,999.99' })
      }
    }

    if (data.isCustomizable !== undefined && typeof data.isCustomizable !== 'boolean') {
      errors.push({ field: 'isCustomizable', message: 'El campo isCustomizable debe ser un valor booleano' })
    }

    return errors
  }
}

// Exportación por defecto para compatibilidad
export default productService