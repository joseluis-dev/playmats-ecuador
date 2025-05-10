import { useCart } from "@/hooks/useCart"
import { CartIcon } from "./icons/CartIcon"

export const Cart = () => {
  const { totalItems } = useCart()
  return (
    <a href="/cart" className="relative hover:bg-[var(--color-surface)] transition-all duration-300 ease-in-out rounded-md p-2 z-100">
      <span className="absolute flex justify-center items-center -top-1 -right-1 text-xs rounded-full bg-[var(--color-primary)] w-5 h-5 text-[var(--color-text)]">{totalItems}</span>
      <CartIcon className="text-[var(--color-text)]"/>
    </a>
  )
}
