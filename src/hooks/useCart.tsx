import { useCartStore } from "@/stores/cartStore"
import { useEffect } from "react"

export const useCart = () => {
  const { cart, addToCart, removeFromCart, clearCart, updateCart, total, totalItems, loadCart } = useCartStore()

  useEffect(() => {
    // Cargar el carrito al montar el componente
    loadCart()
  }, [])

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