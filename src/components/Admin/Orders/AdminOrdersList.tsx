import React from 'react'
import type { ApiOrder } from '@/types/api-order'
import AdminOrderRow from './AdminOrderRow'

interface AdminOrdersListProps {
  orders: ApiOrder[]
}

export const AdminOrdersList: React.FC<AdminOrdersListProps> = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed'>
        <div className='mb-4 p-4 rounded-full bg-muted'>
          <svg width='32' height='32' viewBox='0 0 24 24' className='text-muted-foreground'><path fill='currentColor' d='M12 2a8 8 0 0 0-8 8c0 3.53 2.61 6.43 6 7.35V22l4.42-3.32l-.26-.08C17.39 16.43 20 13.53 20 10a8 8 0 0 0-8-8m0 2a6 6 0 0 1 6 6c0 2.65-1.72 4.97-4.29 5.71L13 16.1V19l-2-1.5V16.1l-.71-.39C7.72 14.97 6 12.65 6 10a6 6 0 0 1 6-6'/></svg>
        </div>
        <h3 className='text-lg font-medium'>No hay órdenes registradas</h3>
        <p className='text-sm text-muted-foreground mt-1 max-w-md'>Las órdenes generadas por los usuarios aparecerán aquí para su revisión y gestión.</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {orders.map(order => (
        <AdminOrderRow key={order.id} order={order} />
      ))}
    </div>
  )
}

export default AdminOrdersList
