import { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import { ProductsList } from '@/components/Admin/Products/ProductsList'
import { ProductForm } from '@/components/Admin/Products/ProductForm'
import type { Product } from '@/types'

export const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const data = await api.get('products')
      setProducts(data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Button onClick={() => setSelectedProduct(null)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        {/* Lista de productos */}
        <ProductsList
          products={products}
          onSelect={setSelectedProduct}
          onDelete={async (id) => {
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
          selectedId={selectedProduct?.id}
        />

        {/* Panel de edición */}
        <div className="bg-[var(--color-surface)]/80 p-6 rounded-lg">
          <ProductForm
            product={selectedProduct}
            onSave={async (product) => {
              const newProduct = {
                name: product.name,
                description: product.description,
                price: product.price,
                isCustomizable: product.isCustomizable,
              }
              try {
                setIsLoading(true)
                if (selectedProduct) {
                  await api.put(`products/${selectedProduct.id}`, newProduct)
                  toast.success('Producto actualizado correctamente')
                } else {
                  await api.post('products', newProduct)
                  toast.success('Producto creado correctamente')
                }
                fetchProducts()
              } catch (error) {
                console.error('Error al guardar el producto:', error)
                toast.error('Error al guardar el producto')
              } finally {
                setIsLoading(false)
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
