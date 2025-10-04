import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { productService } from '@/services/productService'
import { DataList } from '@/components/DataList'
import { ProductForm } from '@/components/Admin/Products/ProductForm'
import type { Product } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductNotFoundError, ProductValidationError, ProductUploadError } from '@/types/product'
import { resourcesService } from '@/services/resourcesService'
import { categoriesService } from '@/services/categoriesService'

export const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await productService.list()
      setProducts(response)
    } catch (error) {
      console.error('Error al cargar los productos:', error)
      toast.error('Error al cargar los productos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <p className="text-sm text-muted-foreground">Administra el catálogo, recursos e información de cada producto.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* Lista de productos */}
        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lista</CardTitle>
            <CardDescription>{products.length} producto{products.length === 1 ? '' : 's'}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataList<Product>
              className='max-h-[500px] overflow-y-auto'
              items={products}
              selectedId={selectedProduct?.id}
              onSelect={setSelectedProduct}
              onDelete={async (id: string) => {
                try {
                  setIsLoading(true)
                  await productService.delete(id)
                  toast.success('Producto eliminado correctamente')
                  fetchProducts()
                } catch (error) {
                  console.error('Error al eliminar el producto:', error)
                  if (error instanceof ProductNotFoundError) {
                    toast.error('El producto no existe')
                  } else if (error instanceof ProductValidationError) {
                    toast.error('Error de validación al eliminar el producto')
                  } else {
                    toast.error('Error al eliminar el producto')
                  }
                } finally {
                  setIsLoading(false)
                }
              }}
              keyExtractor={(product) => product.id}
              renderItem={(product) => (
                <>
                  <h3 className="font-medium leading-none">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    ${product.price?.toFixed(2)} · {product.isCustomizable ? 'Personalizable' : 'No personalizable'}
                  </p>
                </>
              )}
              emptyListComponent={
                <div className="text-center p-6 text-muted-foreground">No hay productos disponibles</div>
              }
            />
          </CardContent>
        </Card>

        {/* Panel de edición */}
        <Card className="relative overflow-hidden">
          {/* Loading overlay (visual only) */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 grid place-items-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-primary" />
            </div>
          )}
          <CardContent className="p-6">
            <ProductForm
              product={selectedProduct}
              setProduct={setSelectedProduct}
              onSave={async (product) => {
                const newProduct = {
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  isCustomizable: product.isCustomizable,
                }
                try {
                  setIsLoading(true)
                  let productId: string;
                  
                  if (selectedProduct) {
                    await productService.replace(selectedProduct.id, newProduct)
                    productId = selectedProduct.id
                    toast.success('Producto actualizado correctamente')
                  } else {
                    const response = await productService.create(newProduct)
                    productId = response.id
                    toast.success('Producto creado correctamente')
                  }

                  const newResources = product.resources.filter(r => r.file)
                  const toDeleteResources = (selectedProduct?.resourceProducts ?? []).filter(({ resource }) => !product.resources.some(r => r.id === resource.id)).map(({ resource }) => resource)
                  
                  if (newResources.length > 0) {
                    const uploadedResources = await Promise.all(newResources.map(async (r) => {
                      const formData = new FormData()
                      if (r.file) formData.append('file', r.file)
                      formData.append('isBanner', r.isBanner ? 'true' : 'false')
                      return productService.uploadResource(productId, formData)
                    }))
                    console.log(uploadedResources)
                    const productsCategory = await categoriesService.list({ name: 'productos' })
                    for (const uploaded of uploadedResources) {
                      await resourcesService.assignCategories(uploaded.resource.id, [...product.categories, productsCategory[0]?.id.toString()].filter(id => id !== undefined) as string[])
                    }
                  }

                  // Nota: La eliminación de recursos individuales requeriría un endpoint específico
                  // que no está disponible en el servicio actual, mantenemos la implementación directa
                  if (toDeleteResources.length > 0) {
                    // Esta funcionalidad requiere un endpoint de recursos que no está en el servicio
                    // Se mantiene la implementación original hasta que se agregue al servicio
                    const { api } = await import('@/services/api')
                    await Promise.all(toDeleteResources.map(async (r) => {
                      return api.delete(`products/${productId}/resources/${r.id}`)
                    }))
                  }

                  // Actualizar categorías y atributos
                  await productService.replaceCategories(productId, {
                    categoryIds: product.categories
                  })
                  
                  await productService.replaceAttributes(productId, {
                    attributeIds: product.attributes
                  })

                  // Recargar productos
                  fetchProducts()
                } catch (error) {
                  console.error('Error al guardar el producto:', error)
                  
                  if (error instanceof ProductValidationError) {
                    const errorMessages = error.validationErrors.map(e => e.message).join(', ')
                    toast.error(`Error de validación: ${errorMessages}`)
                  } else if (error instanceof ProductUploadError) {
                    toast.error('Error al subir los recursos del producto')
                  } else if (error instanceof ProductNotFoundError) {
                    toast.error('El producto no existe')
                  } else {
                    toast.error('Error al guardar el producto')
                  }
                } finally {
                  setIsLoading(false)
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
