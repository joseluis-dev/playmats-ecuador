import React, { useEffect, useState } from 'react'
import { orderService } from '@/services/orderService'
import { UserOrdersList } from './UserOrdersList'
import { Button } from '@/components/ui/button'
import type { ApiOrder } from '@/types/api-order'

export const UserOrdersSection: React.FC = () => {
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      setError(null)
      setLoading(true)
      // @ts-ignore – asumimos que la API ya devuelve en camelCase (si devuelve snake_case habría que mapear)
      const data = await orderService.listByUser()
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

  if (loading) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='h-40 rounded-xl border bg-accent/10 animate-pulse' />
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Mis Órdenes</h2>
        <Button size='sm' variant='outline' onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>
      {error && (
        <div className='p-4 border rounded-md text-sm text-red-600 bg-red-500/10'>
          {error}
        </div>
      )}
      <UserOrdersList orders={orders} />
    </div>
  )
}

export default UserOrdersSection
