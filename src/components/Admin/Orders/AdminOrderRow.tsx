import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ApiOrder, ApiPayment, ApiOrderProduct } from '@/types/api-order'

const orderStatusStyles: Record<ApiOrder['status'], string> = {
  PENDING: 'bg-amber-500/15 text-amber-600 border border-amber-500/30',
  DELIVERED: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
  CANCELLED: 'bg-red-500/15 text-red-600 border border-red-500/30'
}

const paymentStatusStyles: Record<ApiPayment['status'], string> = {
  PENDING: 'bg-amber-500/15 text-amber-600 border border-amber-500/30',
  COMPLETED: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
  FAILED: 'bg-red-500/15 text-red-600 border border-red-500/30'
}

function formatDate(value?: string) {
  if (!value) return '—'
  try {
    const d = new Date(value)
    return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return value
  }
}

function ResourcePreview({ op }: { op: ApiOrderProduct }) {
  const banner = op.product?.resourceProducts?.find((rp: any) => rp.isBanner)?.resource || op.product?.resourceProducts?.[0]?.resource
  const name = op.product?.name ?? `Producto ${op.id}`
  return (
    <div className='flex items-center gap-3'>
      <div className='size-12 rounded-md overflow-hidden bg-accent/20 border'>
        {banner?.thumbnail || banner?.url ? (
          <img src={banner?.thumbnail || banner?.url} className='w-full h-full object-cover' alt={name} />
        ) : (
          <div className='w-full h-full grid place-items-center text-xs text-muted-foreground'>N/A</div>
        )}
      </div>
      <div className='flex flex-col'>
        <span className='text-sm font-medium'>{name}</span>
        <span className='text-xs text-muted-foreground'>Cant. {op.quantity} • Unit ${op.unitPrice.toFixed(2)}</span>
      </div>
    </div>
  )
}

export const AdminOrderRow: React.FC<{ order: ApiOrder }> = ({ order }) => {
  const [open, setOpen] = useState(false)
  const payment = order.payments?.[0]
  const totalItems = order.orderProducts?.reduce((a, p) => a + (p.quantity || 0), 0)

  return (
    <Card className={cn('overflow-hidden', open && 'ring-1 ring-primary/30')}>      
      <CardHeader className='pb-4 border-b'>
        <div className='flex items-start justify-between gap-4 flex-wrap'>
          <div className='flex items-center gap-3'>
            <CardTitle className='text-base text-[var(--color-primary)]'>Orden</CardTitle>
            <span className='font-mono text-xs px-2 py-1 rounded bg-muted text-muted-foreground tracking-tight'>#{order.id.slice(0,8)}</span>
            <CardDescription className='flex flex-wrap gap-2'>
              <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium', orderStatusStyles[order.status])}>{order.status}</span>
              {payment && <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium', paymentStatusStyles[payment.status])}>Pago {payment.status}</span>}
              <span className='text-[11px] px-2 py-0.5 rounded-full bg-accent/40 text-accent-foreground border border-border/50'>Items: {totalItems}</span>
            </CardDescription>
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-right'>
              <div className='text-xs text-muted-foreground uppercase'>Total</div>
              <div className='text-lg font-bold'>${order.totalAmount.toFixed(2)}</div>
            </div>
            <Button variant='outline' size='sm' className='min-w-20' onClick={() => setOpen(!open)}>{open ? 'Ocultar' : 'Ver'}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-4 pb-0'>
        <div className='grid md:grid-cols-3 gap-4'>
          <div className='md:col-span-2'>
            <div className='text-xs font-medium text-muted-foreground uppercase mb-1'>Envío</div>
            <div className='text-sm'>
              {[
                [order.shippingAddress?.addressOne, order.shippingAddress?.addressTwo].filter(Boolean).join(', '),
                [order.shippingAddress?.city, order.shippingAddress?.state?.nombre].filter(Boolean).join(', '),
                [order.shippingAddress?.postalCode, order.shippingAddress?.country?.nombre].filter(Boolean).join(', ')
              ].filter(Boolean).join(' • ')}
            </div>
            {order.shippingAddress?.fullname && (
              <div className='text-xs text-muted-foreground mt-1'>Contacto: {order.shippingAddress.fullname}{order.shippingAddress.phone ? ` • ${order.shippingAddress.phone}` : ''}</div>
            )}
          </div>
          <div>
            <div className='text-xs font-medium text-muted-foreground uppercase mb-1'>Tiempos</div>
            <div className='text-sm'>Creada: {formatDate(order.createdAt)}</div>
            <div className='text-sm'>Actualizada: {formatDate(order.updatedAt)}</div>
          </div>
        </div>

        {open && (
          <div className='mt-6 grid lg:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold'>Productos</h4>
                <span className='text-xs text-muted-foreground'>Total items: {totalItems}</span>
              </div>
              <div className='rounded-lg border divide-y bg-accent/10'>
                {order.orderProducts?.map(op => (
                  <div key={op.id} className='p-3 flex items-center justify-between gap-3'>
                    <ResourcePreview op={op} />
                    <div className='text-sm font-semibold'>${op.subtotal.toFixed(2)}</div>
                  </div>
                ))}
                {(!order.orderProducts || order.orderProducts.length === 0) && (
                  <div className='p-4 text-sm text-muted-foreground italic'>Sin productos</div>
                )}
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold'>Pago</h4>
                {payment?.method && <span className='text-xs text-[var(--color-primary)]'>Método: {payment.method}</span>}
              </div>
              <div className='rounded-lg border bg-accent/10 p-4 flex flex-col gap-3'>
                {payment ? (
                  <>
                    <div className='flex items-center justify-between'>
                      <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium', paymentStatusStyles[payment.status])}>Estado: {payment.status}</span>
                      <span className='text-sm font-semibold'>Monto: ${payment.amount?.toFixed(2)}</span>
                    </div>
                    {payment.imageUrl && payment.method === 'CASH' && (
                      <div className='grid gap-2'>
                        <div className='text-xs text-muted-foreground'>Comprobante</div>
                        <a href={payment.imageUrl} target='_blank' rel='noreferrer' className='block rounded-md overflow-hidden border bg-background'>
                          <img src={payment.imageUrl} alt='Comprobante de pago' className='w-full object-contain max-h-72' />
                        </a>
                      </div>
                    )}
                    <div className='flex flex-wrap gap-2 pt-2'>
                      <Button size='sm' className='pointer-events-none opacity-60'>Aprobar pago</Button>
                      <Button size='sm' variant='destructive' className='pointer-events-none opacity-60'>Rechazar pago</Button>
                      <Button size='sm' variant='outline' className='pointer-events-none opacity-60'>Cancelar orden</Button>
                    </div>
                  </>
                ) : (
                  <div className='text-sm text-muted-foreground italic'>Sin pagos asociados</div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className='justify-end gap-2 mt-6 border-t'>
        <Button size='sm' variant='ghost' onClick={() => setOpen(!open)}>{open ? 'Cerrar' : 'Ver más'}</Button>
      </CardFooter>
    </Card>
  )
}

export default AdminOrderRow
