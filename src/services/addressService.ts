import { api } from './api'
import type { Country, ShippingAddress, State } from '@/types'

const ADDRESSES_ENDPOINT = 'shipping'
const COUNTRIES_ENDPOINT = 'countries'
const STATES_ENDPOINT = 'states'

export const addressService = {
  // Locations
  getCountries: async (): Promise<Country[]> => {
    return await api.get<Country[]>(`${COUNTRIES_ENDPOINT}`)
  },
  getStates: async (countryId?: number | string): Promise<State[]> => {
    if (countryId === undefined || countryId === null || countryId === '') {
      return await api.get<State[]>(`${STATES_ENDPOINT}`)
    }
    return await api.get<State[]>(`${STATES_ENDPOINT}?countryId=${countryId}`)
  },

  // Addresses by user
  listByUser: async (userId: string): Promise<ShippingAddress[]> => {
    return await api.get<ShippingAddress[]>(`${ADDRESSES_ENDPOINT}?user=${userId}`)
  },
  create: async (address: Omit<ShippingAddress, 'id'>): Promise<ShippingAddress> => {
    return await api.post<ShippingAddress>(`${ADDRESSES_ENDPOINT}`, address)
  },
  update: async (id: number, address: Partial<ShippingAddress>): Promise<ShippingAddress> => {
    return await api.put<ShippingAddress>(`${ADDRESSES_ENDPOINT}/${id}`, address)
  },
  delete: async (id: number): Promise<boolean> => {
    return await api.delete(`${ADDRESSES_ENDPOINT}/${id}`)
  },
  // Prefer a dedicated endpoint if backend provides it; otherwise toggle current via patch
  setDefault: async (id: number, userId?: string): Promise<ShippingAddress> => {
    return await api.patch<ShippingAddress>(`${ADDRESSES_ENDPOINT}/${id}`, { current: true, user: { id: userId } })
  }
}
