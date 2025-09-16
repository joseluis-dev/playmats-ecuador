import type { PaymentFormValues } from '@/components/Payment/PaymentForm'
import { api } from './api'
import type { Order, OrderProduct, OrderStatus, Payment, PaymentMethod, Cart } from '@/types'
import type { CartItemType } from '@/stores/cartStore'
import type { ApiOrder } from '@/types/api-order'
import { useUser } from '@/stores/userStore'

// Convención base (ajusta si en tu backend difiere, revisa tu Postman):
//  - Listar /orders
//  - Listar por usuario: /orders?user={userId}
//  - CRUD producto dentro de orden vía sub‑recurso: /orders/{orderId}/products
//  - Pago: /orders/{orderId}/payments
//  - Evidencia (comprobante): /orders/{orderId}/payments/proof  (multipart)
// Si en el collection JSON los paths cambian (ej: /order-products, /payments),
// solo modifica las constantes/paths aquí conservando las firmas públicas.

const ORDERS_ENDPOINT = 'orders'

// Helpers internos de mapeo (puedes ajustarlos si la API espera otras llaves)
interface CreateOrderParams {
  user: { id: string }
  shippingAddress: { id: number }
  billingAddress?: string
  totalAmount?: number
  status?: OrderStatus
  // Permitir crear con productos directamente
  orderProducts?: Array<{ product: { id: string }; quantity: number; }>,
  payments?: Omit<Payment, 'id' | 'orderId' | 'createdAt' | 'paidAt'>[]
}

interface AddProductParams {
  product: { id: string }
  quantity: number
}

interface AttachPaymentParams {
  amount: number
  method: PaymentMethod
  providerPaymentId?: string
  imageUrl?: string
}

const getUserId = () => useUser.getState().user?.id ?? null;
const userId = getUserId();

export const orderService = {
  // Listado general (admin)
  list: async (): Promise<Order[]> => {
    return await api.get<Order[]>(`${ORDERS_ENDPOINT}`)
  },

  // Listado por usuario autenticado
  listByUser: async (): Promise<Order[]> => {
    if (!userId) {
      return []
    }
    const orders = await api.get<Order[]>(`${ORDERS_ENDPOINT}?user=${userId}`)
    const ordersWithProducts = await Promise.all(orders.map(async (order) => {
      const products = await api.get<OrderProduct[]>(`${ORDERS_ENDPOINT}/${order.id}/order-products`);
      return { ...order, orderProducts: products };
    }));
    return ordersWithProducts;
  },

  // Obtener una orden
  get: async (orderId: string): Promise<Order> => {
    if (!userId) {
      return null as unknown as Order
    }
    return await api.get<Order>(`${ORDERS_ENDPOINT}/${orderId}`)
  },

  // Crear una orden (opcionalmente con productos incluidos)
  create: async (params: CreateOrderParams, comprobante?: File): Promise<Order> => {
    if (!userId) {
      throw new Error('Usuario no autenticado')
    }
    const formData = new FormData();
      formData.append('order', JSON.stringify(params));
      formData.append('paymentImage', comprobante as Blob);
    return await api.postForm(`${ORDERS_ENDPOINT}`, formData)
  },

  // Crear una orden a partir del carrito local
  createFromCart: async (cart: CartItemType[], values: PaymentFormValues): Promise<Order> => {
    if (!userId) {
      throw new Error('Usuario no autenticado')
    }
    try {
      if (!userId) {
        throw new Error('Usuario no autenticado')
      }
      const shippingAddress = values.shippingAddress;
      if (!cart || cart.length === 0) {
        throw new Error('El carrito está vacío')
      }
      if (!shippingAddress || typeof shippingAddress.id !== 'number') {
        throw new Error('Se requiere una dirección de envío para crear la orden')
      }
      interface OrderProductInput {
        product: { id: string };
        quantity: number;
      }
      console.log({ cart, values });
      const orderProducts: OrderProductInput[] = cart.map((cp: CartItemType): OrderProductInput => ({
        product: { id: cp.id },
        quantity: cp.quantity,
      }))
      return await orderService.create({
        user: { id: userId },
        shippingAddress: { id: shippingAddress.id },
        billingAddress: shippingAddress.addressOne + ' y ' + (shippingAddress.addressTwo ?? ''),
        status: 'PENDING',
        orderProducts,
        payments: values.comprobante ? [{
          amount: 0,
          providerPaymentId: 'N/A',
          method: 'CASH',
          status: 'PENDING',
          imageUrl: ''
        }] : undefined
      }, values.comprobante)
    } catch (e) {
      console.error('Error creando orden desde carrito:', e);
      throw e;
    }
  },

  update: async (orderId: string, order: ApiOrder): Promise<Order> => {
    if (!orderId) {
      throw new Error('orderId es requerido')
    }
    const mappedOrder: Partial<Order> = {
      status: order.status,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress.id ? { id: order.shippingAddress.id } : undefined,
      billingAddress: order.billingAddress,
      orderProducts: order.orderProducts?.map(op => ({
        product: { id: op.product?.id || '' },
        quantity: op.quantity
      })) as OrderProduct[] | undefined
    }
    return await api.patch<Order>(`${ORDERS_ENDPOINT}/${orderId}`, mappedOrder)
  },

  // Subir comprobante de pago (si el backend lo soporta como multipart)
  uploadPaymentProof: async (orderId: string, file: File): Promise<Payment> => {
    if (!orderId) {
      throw new Error('orderId es requerido')
    }
    const formData = new FormData()
    formData.append('file', file)
    // Ajusta el path si tu API usa otro segmento (ej: /proof o /receipt)
    return await api.postForm(`${ORDERS_ENDPOINT}/${orderId}/payments/proof`, formData)
  },
}

export type { CreateOrderParams, AddProductParams, AttachPaymentParams }
