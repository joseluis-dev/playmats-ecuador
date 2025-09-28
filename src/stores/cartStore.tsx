import { create } from "zustand";
import { cartService } from "@/services/cartService";
import type { Cart, Product, ResourceProduct } from "@/types";
import { useUser } from "./userStore";

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
  initialized: boolean; // evita cargas múltiples innecesarias
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

const getUserId = () => useUser.getState().user?.id ?? null;

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  total: "0",
  totalItems: 0,
  loading: false,
  error: null,
  initialized: false,

  loadCart: async () => {
    const uid = getUserId();
    set({ loading: true, error: null });
    if (!uid) {
      // Usuario no autenticado: mantener estado local existente (no borrar para permitir carrito guest)
      set({ loading: false, initialized: true });
      return;
    }
    try {
      const cartArr = await cartService.listByUser(uid);
      if (!cartArr || cartArr.length === 0) {
        set({ cart: [], loading: false, initialized: true });
        return;
      }
      if (cartArr.length > 1) {
        throw new Error('Se encontraron múltiples carritos para el usuario. Por favor, contacte al soporte.');
      }
      const mapped = mapCartApiToItems(cartArr[0]);
      const { total, totalItems } = computeTotals(mapped);
      set({ cart: mapped, total, totalItems, loading: false, error: null, initialized: true });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Error al cargar carrito', initialized: true });
    }
  },

  addToCart: async (item) => {
    const uid = getUserId();
    // Actualización optimista local (funciona también para guest)
    const current = get().cart.slice();
    const exists = current.find(ci => ci.id === item.id);
    let newCart: CartItemType[];
    if (exists) {
      exists.quantity += 1;
      exists.subtotal = (exists.price * exists.quantity).toFixed(2);
      newCart = [...current];
    } else {
      newCart = [...current, { ...item, quantity: 1, subtotal: Number(item.price || 0).toFixed(2) }];
    }
    const { total, totalItems } = computeTotals(newCart);
    set({ cart: newCart, total, totalItems });

    if (!uid) {
      // guest: no sincronizar con backend
      return;
    }
    try {
      const existCart = await cartService.listByUser(uid);
      if (existCart.length > 1) {
        throw new Error('Se encontraron múltiples carritos para el usuario. Por favor, contacte al soporte.');
      }
      const newItem: Cart = {
        user: { id: uid },
        cartProducts: [
          { product: { id: item.id } as Product, quantity: 1, price: item.price ?? 0 }
        ]
      };
      if (!existCart || existCart.length === 0) {
        await cartService.create(newItem);
      } else if (exists) {
        await get().updateCart(exists, exists.quantity); // ya incrementado
        return; // updateCart refresca
      } else {
        await get().updateCart(item, 1);
        return;
      }
      // sincronizar estado después de crear
      await get().loadCart();
    } catch (e) {
      console.error('Error al agregar item al carrito:', e);
      // rollback básico (re-cargar desde API si es posible)
      await get().loadCart();
    }
  },

  removeFromCart: async (item) => {
    const uid = getUserId();
    // optimista
    const filtered = get().cart.filter(ci => ci.id !== item.id);
    const { total, totalItems } = computeTotals(filtered);
    set({ cart: filtered, total, totalItems });
    if (!uid) return; // guest
    try {
      const exists = { ...item };
      await get().updateCart(exists, 0); // updateCart hará loadCart
    } catch (e) {
      console.error('Error al eliminar item del carrito:', e);
      await get().loadCart();
    }
  },

  clearCart: async () => {
    const uid = getUserId();
    set({ cart: [], total: '0', totalItems: 0 });
    if (!uid) return;
    try {
      await cartService.clearByUser(uid);
    } catch (e) {
      console.error('Error al limpiar carrito:', e);
    } finally {
      await get().loadCart();
    }
  },

  updateCart: async (item, quantity) => {
    const uid = getUserId();
    // optimista local
    const current = get().cart.slice();
    const idx = current.findIndex(ci => ci.id === item.id);
    if (idx >= 0) {
      if (quantity <= 0) {
        current.splice(idx, 1);
      } else {
        current[idx].quantity = quantity;
        current[idx].subtotal = (current[idx].price * quantity).toFixed(2);
      }
    } else if (quantity > 0) {
      current.push({ ...item, quantity, subtotal: (item.price * quantity).toFixed(2) });
    }
    const { total, totalItems } = computeTotals(current);
    set({ cart: current, total, totalItems });
    if (!uid) return; // guest
    try {
      const userCart = await cartService.listByUser(uid);
      if (userCart.length === 0) {
        throw new Error('No se encontró un carrito para el usuario.');
      }
      const cartId = userCart[0].id;
      if (cartId === undefined) {
        throw new Error('El carrito no tiene un id válido');
      }
      const exists = current.find(ci => ci.id === item.id);
      if (!exists && quantity > 0) {
        const updatedCart = {
          ...userCart[0],
          cartProducts: [
            ...(userCart[0].cartProducts || []),
            { product: { id: item.id } as Product, quantity }
          ]
        };
        await cartService.update(updatedCart, cartId);
      } else if (!exists && quantity <= 0) {
        // nada que hacer, ya fue removido
      } else if (exists && quantity <= 0) {
        const updatedCart = {
          ...userCart[0],
          cartProducts: (userCart[0].cartProducts || []).filter((cp) => {
            const cartProductID = (cp as any).id;
            return cartProductID !== exists?.cartItemId;
          }),
        };
        await cartService.update(updatedCart, cartId);
      } else {
        const updatedCartProducts = userCart[0].cartProducts?.map((cp) => {
          const cartProductID = (cp as any).id;
          if (cartProductID === exists?.cartItemId) {
            return { ...cp, quantity };
          }
          return cp;
        });
        const updatedCart = { ...userCart[0], cartProducts: updatedCartProducts };
        await cartService.update(updatedCart, cartId);
      }
    } catch (e) {
      console.error('Error al actualizar item del carrito:', e);
      await get().loadCart(); // re-sync
    } finally {
      await get().loadCart();
    }
  },
}));
