import { CartIcon } from "./icons/CartIcon"

export const Cart = () => {
  return (
    <button className="relative hover:bg-[var(--color-surface)] transition-all duration-300 ease-in-out rounded-md p-2 z-100">
      <span className="absolute flex justify-center items-center -top-1 -right-1 text-xs rounded-full bg-[var(--color-primary)] text-[var(--btn-primary-text)] w-5 h-5">1</span>
      <CartIcon />
    </button>
  )
}
