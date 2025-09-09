import React, { useEffect, useMemo, useState } from 'react'
import { orderService } from '@/services/orderService'
import type { ApiOrder } from '@/types/api-order'
import AdminOrdersList from './AdminOrdersList'
import { Button } from '@/components/ui/button'

const statusOptions: Array<{ label: string; value: ApiOrder['status'] | 'ALL' }> = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendiente', value: 'PENDING' },
  { label: 'Entregada', value: 'DELIVERED' },
  { label: 'Cancelada', value: 'CANCELLED' },
]

export const AdminOrdersSection: React.FC = () => {
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<typeof statusOptions[number]['value']>('ALL')

  const load = async () => {
    try {
      setError(null)
      setLoading(true)
      // @ts-ignore confiar en el shape de la API como en la vista de usuario
      const data = await orderService.list()
      setOrders(data as unknown as ApiOrder[])
    } catch (e: any) {
      setError(e?.message || 'Error cargando órdenes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return orders
    return orders.filter(o => o.status === statusFilter)
  }, [orders, statusFilter])

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold'>Órdenes</h1>
          <p className='text-sm text-muted-foreground'>Administra las órdenes generadas por los usuarios.</p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1 p-1 rounded-lg border bg-background'>
            {statusOptions.map(opt => (
              <Button key={opt.value} variant={statusFilter === opt.value ? 'default' : 'ghost'} size='sm' onClick={() => setStatusFilter(opt.value)}>
                {opt.label}
              </Button>
            ))}
          </div>
          <Button size='sm' variant='outline' className='min-w-24' onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <>
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-current rounded-full" />
            </> : 'Actualizar'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className='space-y-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='h-44 rounded-xl border bg-accent/10 animate-pulse' />
          ))}
        </div>
      ) : (
        <>
          {error && (
            <div className='p-4 border rounded-md text-sm text-red-600 bg-red-500/10'>{error}</div>
          )}
          <AdminOrdersList orders={filtered} setOrders={setOrders} />
        </>
      )}
    </div>
  )
}

export default AdminOrdersSection
