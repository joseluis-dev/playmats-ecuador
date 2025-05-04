import { useCartStore } from "@/stores/cartStore"

export const useCart = () => {
  const { cart, addToCart, removeFromCart, clearCart, updateCart, total, totalItems } = useCartStore()

  return {
    cart,
    total,
    totalItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateCart
  }
}