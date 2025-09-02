import { create } from "zustand";
import { cartService } from "@/services/cartService";
import type { Cart, Product, ResourceProduct } from "@/types";

// Tipo para un producto en el carrito
export interface CartItemType {
  // ID del producto (se usa para el enlace /playmats/:id)
  id: string;
  price: number;
  quantity: number;
  subtotal: string; // mantener string para UI
  // ID del item en el carrito en el backend (para update/delete)
  cartItemId?: string | number;
  // Aceptar enriquecimiento con datos del producto para UI
  name?: string;
  resourceProducts?: ResourceProduct[];
  product?: Product | any;
  [key: string]: any; // Para permitir propiedades adicionales como 'image', 'category', etc.
}

// Tipo para el estado del store
interface CartState {
  cart: CartItemType[];
  total: string;
  totalItems: number;
  loading: boolean;
  error: string | null;
  // Sin cambiar la firma pública para los componentes actuales
  addToCart: (item: Omit<CartItemType, 'quantity' | 'subtotal'>) => Promise<void> | void;
  removeFromCart: (item: CartItemType) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
  updateCart: (item: CartItemType, quantity: number) => Promise<void> | void;
  // Nueva acción para hidratar desde API
  loadCart: () => Promise<void>;
}

// Helpers
const computeTotals = (items: CartItemType[]) => {
  const total = items.reduce((acc, it) => acc + parseFloat(it.subtotal || '0'), 0);
  const totalItems = items.reduce((acc, it) => acc + (it.quantity || 0), 0);
  return { total: total.toFixed(2), totalItems };
};

const mapCartApiToItems = (carts: Cart[]): CartItemType[] => {
  return carts.map((c) => {
    const product = (c as any).product || (c.products && c.products[0]) || (c as any).product_id || null;
    const productId = (product && (product.id || product.product_id)) ?? String(c.id);
    const price = (c.price ?? (product?.price ?? 0)) as number;
    const quantity = c.quantity ?? 1;
    const subtotalNum = (c.subtotal ?? quantity * price) as number;
    const name = product?.name ?? undefined;
    const resourceProducts = product?.resourceProducts ?? product?.productResources ?? [];
    return {
      id: String(productId),
      price,
      quantity,
      subtotal: Number(subtotalNum).toFixed(2),
      cartItemId: c.id,
      name,
      resourceProducts,
      product: product ?? undefined,
    } as CartItemType;
  });
};

const fetchCurrentUserId = async (): Promise<string | null> => {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  total: "0",
  totalItems: 0,
  loading: false,
  error: null,

  loadCart: async () => {
    set({ loading: true, error: null });
    const userId = await fetchCurrentUserId();
    if (!userId) {
      // Usuario no autenticado: mantener estado local
      set({ cart: [], loading: false });
      return;
    }
    try {
      const apiItems = await cartService.listByUser(userId);
      const mapped = mapCartApiToItems(apiItems);
      console.log(mapped)
      const { total, totalItems } = computeTotals(mapped);
      set({ cart: mapped, total, totalItems, loading: false, error: null });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Error al cargar carrito' });
    }
  },

  addToCart: async (item) => {
    const userId = await fetchCurrentUserId();
    if (!userId) {
      return
    }
    try {
      await cartService.addItem({ userId, productId: item.id, quantity: 1, price: item.price ?? 0 });
    } catch (e) {
      console.error('Error al agregar item al carrito:', e);
    }
  },

  removeFromCart: async (item) => {
    const userId = await fetchCurrentUserId();
    if (!userId) {
      return;
    }
    try {
      // Borrar primero en backend
      let cartItemId = item.cartItemId as string | number | undefined;
      if (!cartItemId) {
        await get().loadCart();
        const found = get().cart.find((c) => c.id === item.id);
        cartItemId = found?.cartItemId;
      }
      if (cartItemId !== undefined) {
        await cartService.deleteItem(cartItemId);
      }
    } catch (e) {
      console.error('Error al eliminar item del carrito:', e);
    }

    await get().loadCart();
  },

  clearCart: async () => {
    const userId = await fetchCurrentUserId();
    if (!userId) {
      return;
    }
    try {
      await cartService.clearByUser(userId);
    } catch (e) {
      console.error('Error al limpiar carrito:', e);
    }

    await get().loadCart();
  },

  updateCart: async (item, quantity) => {
    const userId = await fetchCurrentUserId();
    if (!userId) {
      return;
    }
    try {
      let cartItemId = item.cartItemId as string | number | undefined;
      if (!cartItemId) {
        await get().loadCart();
        const found = get().cart.find((c) => c.id === item.id);
        cartItemId = found?.cartItemId;
      }
      if (cartItemId !== undefined) {
        await cartService.updateItem(cartItemId, quantity);
      }
      await get().loadCart();
    } catch {
      await get().loadCart();
    }
  },
}));
