import { useCartStore } from "@/stores/cartStore"
import { useEffect } from "react"

export const useCart = () => {
  const { cart, addToCart, removeFromCart, clearCart, updateCart, total, totalItems, loadCart, loading, initialized } = useCartStore()

  useEffect(() => {
    if (!initialized) {
      loadCart();
    }
  }, [initialized, loadCart])

  return { cart, total, totalItems, loading, addToCart, removeFromCart, clearCart, updateCart, loadCart }
}