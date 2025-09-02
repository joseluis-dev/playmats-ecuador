import { useEffect, useMemo, useState } from "react";
import { AddressList } from "./AddressList";
import { AddressForm } from "./AddressForm";
import { addressService } from "@/services/addressService";
import type { ShippingAddress } from "@/types";

// Interfaces para manejo de datos
export interface Address {
  id?: number;
  fullname: string;
  phone: string;
  country: string; // UI-friendly country name or id
  state: string;   // UI-friendly state name or id
  city: string;
  postal_code: string;
  address_one: string;
  address_two?: string;
  current: boolean;
}

// Helpers to map API ShippingAddress to local Address UI type
function mapFromApi(a: ShippingAddress, statesById: Record<number, string>, countriesById: Record<number, string>): Address {
  return {
    id: a.id,
    fullname: a.fullname || "",
    phone: a.phone || "",
    country: a.country != null ? countriesById[a.country.id as number] ?? String(a.country.id) : "",
    state: a.state != null ? statesById[a.state.id as number] ?? String(a.state.id) : "",
    city: a.city || "",
    postal_code: a.postalCode || "",
    address_one: a.addressOne || "",
    address_two: a.addressTwo || "",
    current: !!a.current,
  }
}

function mapToApi(a: Address, countryIdLookup: Record<string, number>, stateIdLookup: Record<string, number>, userId: string): Omit<ShippingAddress, 'id'> {
  const country_id = countryIdLookup[a.country] ?? Number(a.country)
  const state_id = stateIdLookup[a.state] ?? Number(a.state)
  return {
    user: {
      id: userId
    },
    fullname: a.fullname,
    phone: a.phone,
    country: {
      id: isNaN(Number(country_id)) ? undefined : Number(country_id)
    },
    state: {
      id: isNaN(Number(state_id)) ? undefined : Number(state_id)
    },
    city: a.city,
    postalCode: a.postal_code,
    addressOne: a.address_one,
    addressTwo: a.address_two,
    current: a.current,
  }
}

export const AddressesClerk = () => {
  // Estados para gestionar la interfaz
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "form">("list");
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [countries, setCountries] = useState<{ id: number; nombre: string }[]>([])
  const [states, setStates] = useState<{ id: number; nombre: string; country_id: number }[]>([])

  const countriesById = useMemo(() => Object.fromEntries(countries.map(c => [c.id, c.nombre])), [countries])
  const statesById = useMemo(() => Object.fromEntries(states.map(s => [s.id, s.nombre])), [states])
  const countryIdLookup = useMemo(() => Object.fromEntries(countries.map(c => [c.nombre, c.id])), [countries])
  const stateIdLookup = useMemo(() => Object.fromEntries(states.map(s => [s.nombre, s.id])), [states])

  useEffect(() => {
    // Load current backend user, countries, states and addresses
    (async () => {
      try {
        setLoading(true)
        setError(null)
        const [meRes, fetchedCountries, fetchedStates] = await Promise.all([
          fetch('/api/me').then(r => r.json() as Promise<{ user: { id: string } | null }>),
          addressService.getCountries(),
          addressService.getStates().catch(() => [] as any)
        ])
        const user = meRes.user
        if (!user?.id) {
          setAddresses([])
          setLoading(false)
          return
        }
        setUserId(user.id)
        setCountries(fetchedCountries as any)
        setStates(fetchedStates as any)
        const statesIndex = Object.fromEntries((fetchedStates as any[]).map((s: any) => [s.id, s.nombre]))
        const countriesIndex = Object.fromEntries((fetchedCountries as any[]).map((c: any) => [c.id, c.nombre]))
        const apiAddresses = await addressService.listByUser(user.id)
        const mapped = apiAddresses.map(a => mapFromApi(a, statesIndex, countriesIndex)).sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
        setAddresses(mapped)
      } catch (e) {
        setError('No se pudieron cargar las direcciones')
      } finally {
        setLoading(false)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Manejadores de eventos con API
  const handleAddAddress = () => {
    setEditingAddress(null);
    setActiveTab("form");
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setActiveTab("form");
  };

  const handleSaveAddress = async (address: Address) => {
    if (!userId) return
    try {
      setLoading(true)
      if (address.id) {
        const payload = mapToApi(address, countryIdLookup, stateIdLookup, userId)
        console.log('Updating address:', payload)
        const updated = await addressService.update(address.id, payload)
      } else {
        const payload = mapToApi(address, countryIdLookup, stateIdLookup, userId)
        console.log('Creating address:', payload)
        const created = await addressService.create(payload)
      }
      const apiAddresses = await addressService.listByUser(userId)
      const mapped = apiAddresses.map(a => mapFromApi(a, statesById as any, countriesById as any)).sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
      setAddresses(mapped)
      setActiveTab("list")
      setEditingAddress(null)
    } catch (e) {
      setError('No se pudo guardar la dirección')
    } finally {
      setLoading(false)
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      setLoading(true)
      const ok = await addressService.delete(id)
      if (ok) setAddresses(prev => prev.filter(a => a.id !== id))
    } catch (e) {
      setError('No se pudo eliminar la dirección')
    } finally {
      setLoading(false)
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    if (!userId) return
    try {
      setLoading(true)
      const updated = await addressService.setDefault(id, userId)
      // Refresh list to ensure only one default
      const apiAddresses = await addressService.listByUser(userId)
      const mapped = apiAddresses.map(a => mapFromApi(a, statesById as any, countriesById as any)).sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
      setAddresses(mapped)
    } catch (e) {
      setError('No se pudo establecer la dirección predeterminada')
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-4">
      <div className="border-b border-gray-200 h-10">
        <h1 className="font-bold text-[17px]">Direcciones de Envío</h1>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
      {/* Encabezado con título y botón de acción */}
      <div className="h-12 flex justify-end items-center w-full">
        {activeTab === "list" ? (
          <button 
            onClick={handleAddAddress}
            className="text-xs px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Agregar Nueva Dirección
          </button>
        ) : (
          <button 
            onClick={() => {
              setActiveTab("list");
              setEditingAddress(null);
            }}
            className="text-xs px-3 py-1 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
          >
            Volver a mis direcciones
          </button>
        )}
      </div>
      
      {/* Contenido principal: lista o formulario */}
      <div className="py-2">
        {activeTab === "list" ? (
          <AddressList 
            addresses={addresses} 
            onEdit={handleEditAddress}
            onDelete={handleDeleteAddress}
            onSetDefault={handleSetDefaultAddress}
          />
        ) : (
          <AddressForm
            initialData={editingAddress} 
            onSave={handleSaveAddress}
            countries={countries as any}
            states={states as any}
          />
        )}
      </div>
    </div>
  );
};
