import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import type { Product } from '@/types'

interface ProductsListProps {
  products: Product[]
  selectedId?: string
  onSelect: (product: Product) => void
  onDelete: (id: string) => void
}

export const ProductsList = ({ products, selectedId, onSelect, onDelete }: ProductsListProps) => {
  return (
    <div className="bg-[var(--color-surface)]/80 rounded-lg overflow-hidden">
      <div className="flex flex-col divide-y divide-[var(--color-text)]/10">
        {products.map(product => (
          <div
            key={product.id}
            className={`p-4 hover:bg-[var(--color-surface)] cursor-pointer transition-colors ${
              selectedId === product.id ? 'bg-[var(--color-surface)]' : ''
            }`}
            onClick={() => onSelect(product)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-[var(--color-text)]/70">
                  ${product.price?.toFixed(2)} - {product.isCustomizable ? 'Personalizable' : 'No personalizable'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(product)
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('¿Está seguro que desea eliminar este producto?')) {
                      onDelete(product.id)
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
