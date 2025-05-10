import type { JSX, MouseEvent } from "react";
import { Button } from "./Button.tsx";
import { CartAddIcon } from "./icons/CartAddIcon.tsx";
import { useCart } from "@/hooks/useCart.tsx";

interface ButtonProps {
  className?: string;
  label?: string;
  icon?: React.ReactNode;
  product?: any
}

export const AddToCartButton = ({ className = '', label = '', icon = null, product = null, ...props }: ButtonProps): JSX.Element => {
  const { addToCart, cart } = useCart()

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (product) {
      addToCart({ ...product, quantity: 1, subtotal: product.price })
    }
  }
  
  return (
    <Button
      className={className}
      icon={<CartAddIcon />}
      label="Añadir"
      onClick={(e) => handleAddToCart(e)}
      {...props}
    />
  );
}
