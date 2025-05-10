import { create } from "zustand";

// Tipo para un producto en el carrito
export interface CartItemType {
  id: string;
  price: number;
  quantity: number;
  subtotal: string;
  [key: string]: any; // Para permitir propiedades adicionales como 'image', 'category', etc.
}

// Tipo para el estado del store
interface CartState {
  cart: CartItemType[];
  total: string;
  totalItems: number;
  addToCart: (item: Omit<CartItemType, 'quantity' | 'subtotal'>) => void;
  removeFromCart: (item: CartItemType) => void;
  clearCart: () => void;
  updateCart: (item: CartItemType, quantity: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  total: "0",
  totalItems: 0,

  addToCart: (item) => set((state: any) => {
    const existing = state.cart.find((b: CartItemType) => b.id === item.id);
    if (existing) {
      return {
        cart: state.cart.map((b: CartItemType) =>
          b.id === item.id
            ? {
                ...b,
                quantity: b.quantity + 1,
                subtotal: ((b.quantity + 1) * item.price).toFixed(2),
              }
            : b
        ),
        total: (parseFloat(state.total) + item.price).toFixed(2),
        totalItems: state.totalItems + 1,
      };
    }
    return {
      cart: [
        ...state.cart,
        { ...item, quantity: 1, subtotal: item.price.toFixed(2) },
      ],
      total: (parseFloat(state.total) + item.price).toFixed(2),
      totalItems: state.totalItems + 1,
    };
  }),

  removeFromCart: (item) =>
    set((state) => ({
      cart: state.cart.filter((b) => b.id !== item.id),
      total: (parseFloat(state.total) - parseFloat(item.subtotal)).toFixed(2),
      totalItems: state.totalItems - item.quantity,
    })),

  clearCart: () => set({ cart: [], total: "0", totalItems: 0 }),

  updateCart: (item, quantity) =>
    set((state) => ({
      cart: state.cart.map((b) =>
        b.id === item.id
          ? {
              ...b,
              quantity,
              subtotal: (quantity * item.price).toFixed(2),
            }
          : b
      ),
      total: (
        parseFloat(state.total) + (quantity - item.quantity) * item.price
      ).toFixed(2),
      totalItems: state.totalItems + (quantity - item.quantity),
    })),
}));
