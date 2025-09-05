import { useEffect } from 'react'
import { useCart } from '@/hooks/useCart'

export const PaymentSummary = () => {
  const { cart, total, loadCart, loading } = useCart() as any

  useEffect(() => {
    // Hidrata desde el backend si hay usuario
    if (typeof loadCart === 'function') {
      loadCart()
    }
  }, [])

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-4">Detalle:</h2>
      <div className="flex justify-end mb-2">
        <span className="text-sm">Total: ${total}</span>
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="text-sm opacity-70">Cargando carrito…</div>
        )}
        {!loading && cart?.length === 0 && (
          <div className="text-sm opacity-70">No hay productos en el carrito.</div>
        )}
        {!loading && cart?.map((item: any) => (
          <div key={`${item.cartItemId ?? item.id}`} className="border-b border-border pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm min-w-4 text-left">{item.quantity}</span>
                <span className="text-sm line-clamp-2">{item.name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm whitespace-nowrap">${Number(item.price).toFixed(2)}</span>
                <span className="text-xs opacity-80 whitespace-nowrap">
                  Subtotal: $
                  {typeof item.subtotal === 'string'
                    ? item.subtotal
                    : Number(item.subtotal ?? (item.quantity * item.price)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-md border border-orange-500 text-orange-500 bg-orange-500/10 text-sm">
        Su pedido será entregado dentro de 5 a 7 días hábiles cuando realice el pago.
      </div>
    </div>
  )
}

export default PaymentSummary
