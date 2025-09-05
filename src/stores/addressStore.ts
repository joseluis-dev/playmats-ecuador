import type { FormValues } from '@/components/Payment/ShippingAddressForm'
import { addressService } from '@/services/addressService'
import type { ShippingAddress } from '@/types'
import { create } from 'zustand'

interface AddressStore {
  loading: boolean
  error: string | null
  addresses: ShippingAddress[]
  selected: ShippingAddress | null
  addAddress: (address: FormValues) => Promise<void>
  updateAddress: (id: number, address: FormValues) => Promise<void>
  setCurrent: (id: number) => void
  loadAddresses: () => Promise<void>
  deleteAddress: (id: number) => Promise<void>
}

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

function mapToApi(a: FormValues, userId: string): Omit<ShippingAddress, 'id'> {
  return {
    user: {
      id: userId
    },
    fullname: a.fullname,
    phone: a.phone,
    country: {
      id: parseInt(a.country)
    },
    state: {
      id: parseInt(a.state)
    },
    city: a.city,
    postalCode: a.postalCode,
    addressOne: a.addressOne,
    addressTwo: a.addressTwo,
    current: a.current,
  }
}

const userId = await fetchCurrentUserId();

export const useAddressStore = create<AddressStore>((set, get) => ({
  loading: false,
  error: null,
  addresses: [] as ShippingAddress[],
  selected: null as ShippingAddress | null,
  loadAddresses: async () => {
    set({ loading: true, error: null });
    if (!userId) {
      set({ addresses: [] });
      return;
    }
    try {
      const apiAddresses = await addressService.listByUser(userId)
      set({ addresses: apiAddresses.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)) })
      const current = apiAddresses.find(a => a.current) || null
      set({ selected: current })
    } catch (error) {
      console.error(error);
      set({ error: 'No se pudieron cargar las direcciones' });
    } finally {
      set({ loading: false });
    }
  },
  addAddress: async (address: FormValues) => {
    set({ loading: true, error: null });
    if (!userId) return;
    try {
      const addressMapped = mapToApi(address, userId)
      const apiAddress = await addressService.create(addressMapped);
      set(state => ({
        addresses: [...state.addresses, apiAddress]
      }));
    } catch (error) {
      console.error(error);
      set({ error: 'No se pudo agregar la dirección' });
    } finally {
      set({ loading: false });
      get().loadAddresses();
    }
  },
  updateAddress: async (id: number, address: FormValues) => {
    set({ loading: true, error: null });
    if (!userId) return;
    try {
      const addressMapped = mapToApi(address, userId)
      const apiAddress = await addressService.update(id, addressMapped);
      set(state => ({
        addresses: state.addresses.map(a => a.id === id ? apiAddress : a)
      }));
    } catch (error) {
      console.error(error);
      set({ error: 'No se pudo actualizar la dirección' });
    } finally {
      set({ loading: false });
      get().loadAddresses();
    }
  },
  setCurrent: async (id: number) => {
    if (!userId) return;
    await addressService.setDefault(id, userId);
    get().loadAddresses();
  },
  deleteAddress: async (id: number) => {
    if (!userId) return;
    await addressService.delete(id);
    get().loadAddresses();
  }
}));