import type { ReactNode } from 'react'
import { Button } from './Button'

interface DataListProps<T> {
  items: T[]
  selectedId?: string
  onSelect?: (item: T) => void
  onDelete?: (id: string) => void
  onEdit?: (item: T) => void
  renderItem: (item: T) => ReactNode
  renderActions?: (item: T) => ReactNode
  keyExtractor: (item: T) => string
  className?: string
  itemClassName?: string
  listHeaderComponent?: ReactNode
  listFooterComponent?: ReactNode
  emptyListComponent?: ReactNode
}

export const DataList = <T,>({
  items,
  selectedId,
  onSelect,
  onDelete,
  onEdit,
  renderItem,
  renderActions,
  keyExtractor,
  className = '',
  itemClassName = '',
  listHeaderComponent,
  listFooterComponent,
  emptyListComponent
}: DataListProps<T>) => {
  if (items.length === 0 && emptyListComponent) {
    return (
      <div className={`bg-[var(--color-surface)]/90 rounded-lg overflow-hidden ${className}`}>
        {emptyListComponent}
      </div>
    )
  }

  return (
    <div className={`bg-[var(--color-surface)]/90 rounded-lg overflow-hidden ${className}`}>
      {listHeaderComponent}
      <div className="flex flex-col divide-y divide-[var(--color-text)]/10">
        {items.map(item => {
          const itemId = keyExtractor(item)
          
          return (
            <div
              key={itemId}
              className={`p-4 hover:bg-[var(--color-surface)] transition-colors ${
                selectedId === itemId ? 'bg-[var(--color-surface)]' : ''
              } ${onSelect ? 'cursor-pointer' : ''} ${itemClassName}`}
              onClick={() => onSelect?.(item)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">{renderItem(item)}</div>
                <div className="flex gap-2">
                  {renderActions?.(item) ?? (
                    <>
                      {onEdit && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(item)
                          }}
                        >
                          Editar
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          className="
                            p-2 transition-all duration-300 ease-in-out
                            rounded-md
                            text-red-600
                            hover:bg-red-500/20
                            self-end
                          "
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(itemId)
                          }}
                          label='Eliminar'
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {listFooterComponent}
    </div>
  )
}
