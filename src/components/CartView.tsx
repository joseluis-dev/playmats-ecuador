import EmptyCart from './EmptyCart';
import CartItem from './CartItem';
import { useCart } from '@/hooks/useCart';
import type { CartItemType } from '@/stores/cartStore';

export default function CartView() {
  const { cart, updateCart, total, removeFromCart } = useCart()

  const removeItem = (item: CartItemType) => {
    removeFromCart(item);
  };

  const updateItem = (item: CartItemType, quantity: number) => {
    updateCart(item, quantity);
  };

  return (
    <div className='w-full max-w-screen-xl mx-auto p-8 md:p-12'>
      <h1 className="text-3xl font-bold mb-6">Tu carrito</h1>
      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="flex flex-col md:flex-row space-y-4 justify-center gap-4">
          <div className='flex flex-col gap-4 w-full items-center'>
            {cart.map((item) => (
              <CartItem key={item.id} item={item} onRemove={removeItem} onUpdate={updateItem} />
            ))}
          </div>
          <div className="text-right w-full md:w-[30%] max-w-[500px] md:max-w-fit mx-auto">
            <div className='md:sticky md:top-[80px] flex flex-col gap-4 w-full'>
              <p className="text-xl font-semibold">Total: ${total}</p>
              <a
                href="/payment"
                className={`flex items-center justify-center gap-2
                  px-4 py-2
                  rounded-lg bg-[var(--color-primary)]/90
                  hover:bg-[var(--color-primary)]
                  transition-colors duration-300 ease-in-out`}
              >
                <span className='text-[var(--color-text)]'>Proceder al pago</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
