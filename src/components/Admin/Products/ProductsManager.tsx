import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import { DataList } from '@/components/DataList'
import { ProductForm } from '@/components/Admin/Products/ProductForm'
import type { Product } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('products')
      setProducts(response as Product[])
    } catch (error) {
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
                  await api.delete(`products/${id}`)
                  toast.success('Producto eliminado correctamente')
                  fetchProducts()
                } catch (error) {
                  console.error('Error al eliminar el producto:', error)
                  toast.error('Error al eliminar el producto')
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
                    await api.put(`products/${selectedProduct.id}`, newProduct)
                    productId = selectedProduct.id
                    toast.success('Producto actualizado correctamente')
                  } else {
                    const response = await api.post('products', newProduct)
                    const createdProduct = response as Product
                    productId = createdProduct.id
                    toast.success('Producto creado correctamente')
                  }

                  const newResources = product.resources.filter(r => r.file)
                  const toDeleteResources = (selectedProduct?.resourceProducts ?? []).filter(({ resource }) => !product.resources.some(r => r.id === resource.id)).map(({ resource }) => resource)
                  
                  if (newResources.length > 0) {
                    await Promise.all(newResources.map(async (r) => {
                      const formData = new FormData()
                      if (r.file) formData.append('file', r.file)
                      formData.append('isBanner', r.isBanner ? 'true' : 'false')
                      return api.postForm(`products/${productId}/resources`, formData)
                    }))
                  }

                  if (toDeleteResources.length > 0) {
                    await Promise.all(toDeleteResources.map(async (r) => {
                      return api.delete(`products/${productId}/resources/${r.id}`)
                    }))
                  }

                  // Actualizar categorías y atributos
                  await api.put(`products/${productId}/categories`, {
                    categoryIds: product.categories
                  })
                  
                  await api.put(`products/${productId}/attributes`, {
                    attributeIds: product.attributes
                  })

                  // Recargar productos
                  fetchProducts()
                } catch (error) {
                  console.error('Error al guardar el producto:', error)
                  toast.error('Error al guardar el producto')
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
