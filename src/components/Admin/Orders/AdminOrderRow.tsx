import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ApiOrder, ApiPayment, ApiOrderProduct } from '@/types/api-order'
import { paymentService } from '@/services/paymentService'
import { orderService } from '@/services/orderService'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

const orderStatusStyles: Record<ApiOrder['status'], string> = {
  PENDING: 'bg-amber-500/15 text-amber-600 border border-amber-500/30',
  DELIVERED: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
  CANCELLED: 'bg-red-500/15 text-red-600 border border-red-500/30'
}

const paymentStatusStyles: Record<ApiPayment['status'], string> = {
  PENDING: 'bg-amber-500/15 text-amber-600 border border-amber-500/30',
  COMPLETED: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
  APPROVED: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
  FAILED: 'bg-red-500/15 text-red-600 border border-red-500/30',
  REJECTED: 'bg-red-500/15 text-red-600 border border-red-500/30'
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
  const [open, setOpen] = useState(false)
  const banner = op.product?.resourceProducts?.find((rp: any) => rp.isBanner)?.resource || op.product?.resourceProducts?.[0]?.resource
  const name = op.product?.name ?? `Producto ${op.id}`
  const previewUrl = banner?.url || banner?.thumbnail

  return (
    <>
      <div className='flex items-center gap-3'>
        <button type='button' onClick={() => previewUrl && setOpen(true)} className='size-12 rounded-md overflow-hidden bg-accent/20 border cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
          {previewUrl ? (
            <img src={previewUrl} className='w-full h-full object-cover' alt={name} />
          ) : (
            <div className='w-full h-full grid place-items-center text-xs text-muted-foreground'>N/A</div>
          )}
        </button>
        <div className='flex flex-col'>
          <span className='text-sm font-medium'>{name}</span>
          <span className='text-xs text-muted-foreground'>Cant. {op.quantity} • Unit ${op.unitPrice.toFixed(2)}</span>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-7xl'>
          <DialogHeader className='flex flex-row items-center justify-between px-4'>
            <DialogTitle>{name}</DialogTitle>
            {previewUrl && (
              <Button size='sm' variant='outline' onClick={() => forceDownload(previewUrl, name.replace(/\s+/g, '_'))}>
                Descargar
              </Button>
            )}
          </DialogHeader>
          <div className='w-full'>
            {previewUrl ? (
              banner?.type === 'VIDEO' || /\.(mp4|webm|ogg)$/i.test(previewUrl) ? (
                <video src={previewUrl} controls className='w-full max-h-[70vh] rounded-md' />
              ) : (
                <img src={previewUrl} alt={name} className='w-full max-h-[70vh] object-contain rounded-md' />
              )
            ) : (
              <div className='p-8 text-center text-muted-foreground'>Recurso no disponible</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function getPrimaryResource(op: ApiOrderProduct) {
  // Nota: resourceProducts proviene del product; usamos any para evitar acoplar a tipos internos
  const rp = (op.product as any)?.resourceProducts as Array<any> | undefined
  const banner = rp?.find((r) => r?.isBanner)?.resource
  return banner || rp?.[0]?.resource || null
}

function filenameFromUrl(url?: string) {
  if (!url) return undefined
  try {
    const u = new URL(url)
    const name = u.pathname.split('/').pop() || undefined
    return name || undefined
  } catch {
    return url.split('/').pop()
  }
}

function toCloudinaryAttachment(url: string, suggestedName?: string) {
  try {
    if (!/res\.cloudinary\.com/.test(url) || /fl_attachment/.test(url)) return url
    // Insert fl_attachment after /upload/
    return url.replace(
      /\/upload\//,
      `/upload/fl_attachment${suggestedName ? ':' + encodeURIComponent(suggestedName) : ''}/`
    )
  } catch {
    return url
  }
}

async function forceDownload(url: string, filename?: string) {
  const name = filename || filenameFromUrl(url) || 'recurso'
  try {
    const res = await fetch(url, { mode: 'cors' })
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
  } catch (e) {
    // Fallback: use Cloudinary fl_attachment or open in new tab with download attr
    const adjusted = toCloudinaryAttachment(url, name)
    const a = document.createElement('a')
    a.href = adjusted
    a.download = name
    a.rel = 'noopener'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
}

export const AdminOrderRow: React.FC<{ order: ApiOrder, setOrders: React.Dispatch<React.SetStateAction<ApiOrder[]>> }> = ({ order, setOrders }) => {
  const [open, setOpen] = useState(false)
  const [openPaymentPreview, setOpenPaymentPreview] = useState(false)
  const payment = order.payments?.[0]
  const [paymentAmount, setPaymentAmount] = useState({ 
    value: payment.amount?.toFixed(2) || 0, 
    error: {
      value: false,
      message: 'El monto no puede ser 0'
    }
  })
  const totalItems = order.orderProducts?.reduce((a, p) => a + (p.quantity || 0), 0)
  
  const handleApprovePayment = async (payment: ApiPayment) => {
    if (Number(paymentAmount.value) === 0 || String(paymentAmount.value) === '' || isNaN(Number(paymentAmount.value))) {
      setPaymentAmount({ ...paymentAmount, error: { value: true, message: 'El monto no puede ser 0' } })
      return
    }
    if (!payment) return
    const paymentUpdated = await paymentService.update(payment.id, { ...payment, amount: paymentAmount.value as number, status: 'APPROVED' })
    setOrders(prev => prev.map(o => {
      if (o.id === order.id) {
        return { ...o, payments: o.payments?.map(p => p.id === payment.id ? paymentUpdated : p) }
      }
      setPaymentAmount({ ...paymentAmount, value: paymentUpdated.amount.toFixed(2), error: { value: false, message: '' } })
      return o
    }))
  }

  const handleRejectPayment = async (payment: ApiPayment) => {
    if (!payment) return
    const paymentUpdated = await paymentService.update(payment.id, { ...payment, status: 'REJECTED' })
    setOrders(prev => prev.map(o => {
      if (o.id === order.id) {
        return { ...o, payments: o.payments?.map(p => p.id === payment.id ? paymentUpdated : p) }
      }
      return o
    }))
  }

  const handleCancelOrder = async (order: ApiOrder) => {
    if (!order) return
    const updatedOrder = await orderService.update(order.id, { ...order, status: 'CANCELLED' })
    setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o) as unknown as ApiOrder[])
  }

  const handleResume = async (order: ApiOrder) => {
    if (!order) return
    const updatedOrder = await orderService.update(order.id, { ...order, status: 'PENDING' })
    setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o) as unknown as ApiOrder[])
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Number(e.target.value) === 0 || String(e.target.value) === '' || isNaN(Number(e.target.value))) {
      setPaymentAmount({ ...paymentAmount, value: e.target.value, error: { value: true, message: 'El monto no puede ser 0' } })
    } else {
      setPaymentAmount({ ...paymentAmount, value: e.target.value, error: { value: false, message: '' } })
    }
  }

  return (
    <Card className={cn('overflow-hidden', open && 'ring-1 ring-primary/30')}>      
      <CardHeader className='pb-4 border-b'>
        <div className='flex items-start justify-between gap-4 flex-wrap'>
          <div className='flex items-center gap-3 flex-wrap'>
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
                {order.orderProducts?.map(op => {
                  const resource = getPrimaryResource(op)
                  const downloadUrl: string | undefined = resource?.url || resource?.thumbnail
                  const suggestedName = (op.product?.name ? op.product.name.replace(/\s+/g, '_') : 'recurso')
                  return (
                    <div key={op.id} className='p-3 flex items-center justify-between gap-3'>
                      <ResourcePreview op={op} />
                      <div className='flex items-center gap-3'>
                        <div className='text-sm font-semibold'>${op.subtotal.toFixed(2)}</div>
                        <Button size='sm' variant='outline' disabled={!downloadUrl} onClick={() => downloadUrl && forceDownload(downloadUrl, suggestedName)}>
                          Descargar
                        </Button>
                      </div>
                    </div>
                  )
                })}
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
                      <div className='flex flex-col gap-2'>
                        <span className='text-sm font-semibold'>Monto: </span>
                        <div className='flex flex-col space-y-1'>
                          <Input
                            value={paymentAmount.value}
                            onChange={handleAmountChange}
                            aria-invalid={paymentAmount.error.value}
                            aria-describedby={paymentAmount.error.value ? `payment-amount-error-${order.id}` : undefined}
                            className={cn(
                              'w-32',
                              paymentAmount.error.value && 'border-destructive text-destructive focus-visible:ring-destructive'
                            )}
                            inputMode='decimal'
                          />
                          {paymentAmount.error.value && (
                            <p
                              id={`payment-amount-error-${order.id}`}
                              className='text-xs text-destructive leading-tight'
                            >
                              El monto no puede ser 0
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {payment.imageUrl && payment.method === 'CASH' && (
                      <div className='grid gap-2'>
                        <div className='text-xs text-muted-foreground'>Comprobante</div>
                        <button
                          type='button'
                          onClick={() => setOpenPaymentPreview(true)}
                          className='block rounded-md overflow-hidden border bg-background cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                          aria-label='Ver comprobante de pago'
                        >
                          <img src={payment.imageUrl} alt='Comprobante de pago' className='w-full object-contain max-h-72' />
                        </button>
                        <Dialog open={openPaymentPreview} onOpenChange={setOpenPaymentPreview}>
                          <DialogContent className='sm:max-w-7xl'>
                            <DialogHeader className='flex flex-row items-center justify-between px-4'>
                              <DialogTitle>Comprobante de pago</DialogTitle>
                              <Button size='sm' variant='outline' onClick={() => forceDownload(payment.imageUrl!, `comprobante_${order.id.slice(0,8)}`)}>
                                Descargar
                              </Button>
                            </DialogHeader>
                            <div className='w-full'>
                              <img src={payment.imageUrl} alt='Comprobante de pago' className='w-full max-h-[70vh] object-contain rounded-md' />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                    <div className='flex flex-wrap gap-2 pt-2'>
                      <Button size='sm' className='text-[var(--color-text)]' onClick={() => handleApprovePayment(payment)}>Aprobar pago</Button>
                      <Button size='sm' className='border border-red-500/50 bg-transparent hover:bg-red-600/60 dark:bg-transparent dark:hover:bg-red-600/60 text-[var(--color-text)]' onClick={() => handleRejectPayment(payment)}>Rechazar pago</Button>
                      <Button size='sm' variant='outline' onClick={() => forceDownload(payment.imageUrl!, `comprobante_${order.id.slice(0,8)}`)}>
                        Descargar comprobante
                      </Button>
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
        <Button size='sm' className='border border-blue-500/50 bg-transparent hover:bg-blue-600/60 dark:bg-transparent dark:hover:bg-blue-600/60 text-[var(--color-text)]' onClick={() => handleResume(order)}>Reanudar orden</Button>
        <Button size='sm' variant='outline' className='text-[var(--color-text)]' onClick={() => handleCancelOrder(order)}>Cancelar orden</Button>
        <Button size='sm' variant='ghost' onClick={() => setOpen(!open)}>{open ? 'Cerrar' : 'Ver más'}</Button>
      </CardFooter>
    </Card>
  )
}

export default AdminOrderRow
