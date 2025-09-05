import { useCartStore } from "@/stores/cartStore"
import { useEffect } from "react"

export const useCart = () => {
  const { cart, addToCart, removeFromCart, clearCart, updateCart, total, totalItems, loadCart, loading } = useCartStore()

  useEffect(() => {
    // Cargar el carrito al montar el componente
    loadCart()
  }, [])

  return {
    cart,
    total,
    totalItems,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    updateCart,
    loadCart,
  }
}