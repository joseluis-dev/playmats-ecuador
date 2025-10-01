import type { JSX, MouseEvent } from "react";
import { Button } from "./Button.tsx";
import { CartAddIcon } from "./icons/CartAddIcon.tsx";
import { useCart } from "@/hooks/useCart.tsx";
import { useUser } from "@/stores/userStore";
import { toast } from "sonner";

interface ButtonProps {
  className?: string;
  label?: string;
  icon?: React.ReactNode;
  product?: any
}

export const AddToCartButton = ({ className = '', label = '', icon = null, product = null, ...props }: ButtonProps): JSX.Element => {
  const { addToCart, cart } = useCart()
  const { user } = useUser();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user?.id) {
      toast.warning('Debes iniciar sesión para añadir al carrito');
      return;
    }
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
