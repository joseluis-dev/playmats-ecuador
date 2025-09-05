import { create } from "zustand";
import { cartService } from "@/services/cartService";
import type { Cart, CartProduct, Product, ResourceProduct } from "@/types";

// Tipo para un producto en el carrito
export interface CartItemType {
  // ID del producto (se usa para el enlace /playmats/:id)
  id: string;
  price: number;
  quantity: number;
  subtotal?: string; // mantener string para UI
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
  addToCart: (item: CartItemType) => Promise<void> | void;
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

const mapCartApiToItems = (cart: Cart): CartItemType[] => {
  return cart.cartProducts?.map((c) => {
    const product = (c as any).product || c.product || (c as any).product_id || null;
    const productId = (product && product.id);
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
    } as CartItemType;
  }) ?? [];
};

const mapItemsToCartApi = (items: CartItemType[], userId: string): Cart => {
  return {
    user: { id: userId },
    cartProducts: items.map((item) => ({
      product: { id: item.id } as Product,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal !== undefined ? Number(item.subtotal) : undefined,
    })),
  };
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
      const cart = await cartService.listByUser(userId);
      if (!cart) {
        set({ cart: [], loading: false });
        return;
      }
      if (cart.length > 1) {
        throw new Error('Se encontraron múltiples carritos para el usuario. Por favor, contacte al soporte.');
      }
      const mapped = mapCartApiToItems(cart[0]);
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
      const existCart = await cartService.listByUser(userId);
      if (existCart.length > 1) {
        throw new Error('Se encontraron múltiples carritos para el usuario. Por favor, contacte al soporte.');
      }

      const currentItems = get().cart;
      const exists = currentItems.find((ci) => ci.id === item.id);
      
      if (exists) {
        // Si ya existe, actualizar cantidad
        await get().updateCart(exists, exists.quantity + 1);
        return;
      }

      const newItem: Cart = {
        user: {
          id: userId
        },
        cartProducts: [
          {
            product: {
              id: item.id
            },
            quantity: 1,
            price: item.price ?? 0,
          }
        ]
      }

      if (!existCart || existCart.length === 0) {
        await cartService.create(newItem);
        return
      }
      console.log({ existCart })
      await get().updateCart(item, 1);
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
      const exists = get().cart.find((ci) => ci.id === item.id);
      if (!exists) {
        throw new Error('El item no existe en el carrito');
      }
      console.log({ exists });
      await get().updateCart(exists, 0);
      get().loadCart();
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
      const userCart = await cartService.listByUser(userId);
      if (userCart.length === 0) {
        throw new Error('No se encontró un carrito para el usuario.');
      }
      const cartId = userCart[0].id;
      if (cartId === undefined) {
        throw new Error('El carrito no tiene un id válido');
      }
      const exists = get().cart.find((ci) => ci.id === item.id);
      if (!exists && quantity > 0) {
        console.log('Agregar nuevo item al carrito');
        const updatedCart = {
          ...userCart[0],
          cartProducts: [
            ...(userCart[0].cartProducts || []),
            { product: { id: item.id } as Product, quantity }
          ]
        }
        await cartService.update(updatedCart, cartId);
        return
      }

      if (exists && quantity <= 0) {
        console.log('Eliminar item del carrito');
        const updatedCart = {
          ...userCart[0],
          cartProducts: (userCart[0].cartProducts || []).filter((cp) => {
            const cartProductID = (cp as any).id;
            return cartProductID !== exists.cartItemId;
          }),
        };
        await cartService.update(updatedCart, cartId);
        return
      }

      const updatedCartProducts = userCart[0].cartProducts?.map((cp) => {
        const cartProductID = (cp as any).id;
        if (cartProductID === exists?.cartItemId) {
          return {
            ...cp,
            quantity
          };
        }
        return cp;
      });

      const updatedCart = {
        ...userCart[0],
        cartProducts: updatedCartProducts,
      };
      console.log({ updatedCart })
      await cartService.update(updatedCart, cartId);
    } catch (e) {
      console.error('Error al actualizar item del carrito:', e);
    } finally {
      await get().loadCart();
    }
  },
}));
