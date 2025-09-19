import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ApiOrder, ApiPayment, ApiShippingAddress } from '@/types/api-order'

interface UserOrdersListProps {
  orders: ApiOrder[]
  onSelectOrder?: (order: ApiOrder) => void
  className?: string
}

const orderStatusStyles: Record<ApiOrder['status'], string> = {
  PENDING: 'bg-amber-500/15 text-amber-600 border border-amber-500/30',
  DELIVERED: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
  CANCELLED: 'bg-red-500/15 text-red-600 border border-red-500/30'
}

const paymentStatusStyles: Record<ApiPayment['status'], string> = {
  PENDING: 'bg-amber-500/15 text-amber-600 border border-amber-500/30',
  COMPLETED: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
  APPROVED: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
  REJECTED: 'bg-red-500/15 text-red-600 border border-red-500/30',
  FAILED: 'bg-red-500/15 text-red-600 border border-red-500/30'
}

function formatDate(value?: string) {
  if (!value) return '—'
  try {
    const d = new Date(value)
    return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }) + '\n' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return value
  }
}

function formatAddress(addr?: ApiShippingAddress) {
  if (!addr) return 'Dirección no disponible'
  const line1 = [addr.addressOne, addr.addressTwo].filter(Boolean).join(', ')
  const line2 = [addr.city, addr.state?.nombre].filter(Boolean).join(', ')
  const line3 = [addr.postalCode, addr.country?.nombre].filter(Boolean).join(', ')
  return [line1, line2, line3].filter(Boolean).join(' • ')
}

export const UserOrdersList: React.FC<UserOrdersListProps> = ({ orders, onSelectOrder, className }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  console.log({ orders })
  if (!orders || orders.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed', className)}>
        <div className='mb-4 p-4 rounded-full bg-muted'>
          <svg width='32' height='32' viewBox='0 0 24 24' className='text-muted-foreground'><path fill='currentColor' d='M12 2a8 8 0 0 0-8 8c0 3.53 2.61 6.43 6 7.35V22l4.42-3.32l-.26-.08C17.39 16.43 20 13.53 20 10a8 8 0 0 0-8-8m0 2a6 6 0 0 1 6 6c0 2.65-1.72 4.97-4.29 5.71L13 16.1V19l-2-1.5V16.1l-.71-.39C7.72 14.97 6 12.65 6 10a6 6 0 0 1 6-6'/></svg>
        </div>
        <h3 className='text-lg font-medium'>No tienes órdenes todavía</h3>
        <p className='text-sm text-muted-foreground mt-1 max-w-md'>Cuando generes una orden aparecerá aquí con su estado y detalles.</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {orders.map(order => {
        const primaryPayment = order.payments?.[0]
        const totalItems = order.orderProducts?.reduce((acc, op) => acc + (op.quantity || 0), 0)
        const isExpanded = !!expanded[order.id]
        return (
          <Card key={order.id} className={cn('overflow-hidden transition-colors', isExpanded && 'ring-1 ring-primary/30')}>            
            <CardHeader className='pb-4 border-b'>
              <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
                <div className='flex flex-col gap-1'>
                  <CardTitle className='text-base md:text-lg flex items-center gap-2'>
                    <span className='text-[var(--color-primary)] font-semibold hidden sm:inline'>Orden</span>
                    <span className='font-mono text-xs px-2 py-1 rounded bg-muted text-muted-foreground tracking-tight'>#{order.id.slice(0, 8)}</span>
                  </CardTitle>
                  <CardDescription className='flex flex-wrap gap-3'>
                    <span className={cn('text-xs px-2 py-1 rounded-full font-medium', orderStatusStyles[order.status])}>{order.status === 'PENDING' ? 'Pendiente' : order.status === 'DELIVERED' ? 'Entregada' : 'Cancelada'}</span>
                    {primaryPayment && (
                      <span className={cn('text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1', paymentStatusStyles[primaryPayment.status])}>
                        {primaryPayment.status === 'PENDING' ? 'Pago pendiente' : primaryPayment.status === 'APPROVED' ? 'Pago aprobado' : 'Pago fallido'}
                      </span>
                    )}
                    <span className='text-xs px-2 py-1 rounded-full bg-accent/40 text-accent-foreground border border-border/50'>Items: {totalItems}</span>
                  </CardDescription>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='flex flex-col text-right'>
                    <span className='text-xs text-muted-foreground uppercase tracking-wide'>Total</span>
                    <span className='text-lg font-bold leading-none'>${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <Button variant='outline' size='sm' className='min-w-20' onClick={() => setExpanded(prev => ({ ...prev, [order.id]: !prev[order.id] }))}>
                    {isExpanded ? 'Ocultar' : 'Detalles'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className='pt-4 pb-0'>
              <div className='grid gap-4 md:grid-cols-3'>
                <div className='flex flex-col gap-1 md:col-span-2'>
                  <span className='text-xs font-medium text-[var(--color-primary)] uppercase tracking-wide'>Envío a</span>
                  <p className='text-sm leading-snug'>{formatAddress(order.shippingAddress)}</p>
                  {order.shippingAddress?.fullname && (
                    <p className='text-xs text-muted-foreground mt-1'>Contacto: {order.shippingAddress.fullname}{order.shippingAddress.phone ? ` • ${order.shippingAddress.phone}` : ''}</p>
                  )}
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Creada</span>
                  <p className='text-sm whitespace-pre leading-tight'>{formatDate(order.createdAt)}</p>
                </div>
              </div>
              {isExpanded && (
                <div className='mt-6 space-y-6 animate-in fade-in slide-in-from-top-1 duration-200'>
                  <div className='space-y-2'>
                    <h4 className='text-sm font-semibold'>Productos</h4>
                    <div className='rounded-lg border divide-y bg-accent/10 backdrop-blur-sm'>
                      {order.orderProducts?.map(op => (
                        <div key={op.id} className='p-3 flex items-center justify-between text-sm'>
                          <div className='flex flex-col gap-2'>
                            <div>
                              <span className='font-medium'>Item {op.product?.id && (<span className='font-mono text-xs px-2 py-1 rounded bg-muted text-muted-foreground tracking-tight'>#{String(op.product.id).slice(0, 8)}</span>)} </span><span className='font-medium'>{op.product?.name}</span>
                            </div>
                            <span className='text-xs text-muted-foreground'>Cantidad: {op.quantity} • Unit: ${op.unitPrice.toFixed(2)}</span>
                          </div>
                          <span className='font-semibold'>${op.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                      {(!order.orderProducts || order.orderProducts.length === 0) && (
                        <div className='p-4 text-sm text-muted-foreground italic'>No hay productos registrados en esta orden.</div>
                      )}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <h4 className='text-sm font-semibold'>Pagos</h4>
                    <div className='rounded-lg border divide-y bg-accent/10 backdrop-blur-sm'>
                      {order.payments?.map(pay => (
                        <div key={pay.id} className='p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-sm'>
                          <div className='flex flex-col gap-1'>
                            <span className='font-medium'>Pago <span className='font-mono text-xs px-2 py-1 rounded bg-muted text-muted-foreground tracking-tight'>#{pay.id.slice(0, 6)}</span> </span>
                            <span className='text-xs text-muted-foreground'>Método: {pay.method} • Monto: ${pay.amount?.toFixed(2)}</span>
                            <span className={cn('text-[10px] w-fit mt-1 px-2 py-0.5 rounded-full font-medium', paymentStatusStyles[pay.status])}>
                              {pay.status === 'PENDING' ? 'Pendiente' : pay.status === 'APPROVED' ? 'Aprobado' : 'Fallido'}
                            </span>
                          </div>
                          <div className='flex flex-col items-end gap-3'>
                            {pay.imageUrl && (
                              <a href={pay.imageUrl} target='_blank' rel='noreferrer' className='text-xs underline text-primary hover:text-primary/80'>Ver comprobante</a>
                            )}
                            {pay.createdAt && <span className='text-[11px] text-muted-foreground'>Pagado: {formatDate(pay.createdAt)}</span>}
                          </div>
                        </div>
                      ))}
                      {(!order.payments || order.payments.length === 0) && (
                        <div className='p-4 text-sm text-muted-foreground italic'>No hay pagos asociados aún.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className='mt-6 justify-between border-t'>
              <div className='text-xs text-muted-foreground'>Actualizada: {formatDate(order.updatedAt)}</div>
              <div className='flex gap-2'>
                {onSelectOrder && (
                  <Button size='sm' variant='secondary' onClick={() => onSelectOrder(order)}>Gestionar</Button>
                )}
                <Button size='sm' variant='ghost' onClick={() => setExpanded(prev => ({ ...prev, [order.id]: !prev[order.id] }))}>
                  {expanded[order.id] ? 'Cerrar' : 'Ver más'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

export default UserOrdersList
