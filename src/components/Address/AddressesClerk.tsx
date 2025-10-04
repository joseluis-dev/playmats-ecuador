import { useEffect, useMemo, useState } from "react";
import { AddressList } from "./AddressList";
import { AddressForm } from "./AddressForm";
import { addressService } from "@/services/addressService";
import type { ShippingAddress } from "@/types";
import { useAddress } from "@/hooks/useAddress";
import type { FormValues } from "../Payment/ShippingAddressForm";
import { Spinner } from "@/components/ui/spinner";

export const AddressesClerk = () => {
  // Estados para gestionar la interfaz
  const { addresses, loadAddresses, addAddress, updateAddress, deleteAddress, setCurrent, error, loading } = useAddress();
  const [activeTab, setActiveTab] = useState<"list" | "form">("list");
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [countries, setCountries] = useState<{ id: number; nombre: string }[]>([])
  const [states, setStates] = useState<{ id: number; nombre: string; country_id: number }[]>([])

  useEffect(() => {
    loadAddresses();
    (async () => {
      try {
        const [fetchedCountries, fetchedStates] = await Promise.all([
          addressService.getCountries(),
          addressService.getStates().catch(() => [] as any)
        ])
        setCountries(fetchedCountries as any)
        setStates(fetchedStates as any)
      } catch (error) {
        console.error(error)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Manejadores de eventos con API
  const handleAddAddress = () => {
    setEditingAddress(null);
    setActiveTab("form");
  };

  const handleEditAddress = (address: ShippingAddress) => {
    setEditingAddress(address);
    setActiveTab("form");
  };

  const handleSaveAddress = async (address: FormValues) => {
    if (address.id) {
      await updateAddress(address.id, address)
    } else {
      await addAddress(address)
    }
    setActiveTab("list")
    setEditingAddress(null)
  };

  const handleDeleteAddress = async (id: number) => {
    await deleteAddress(id)
  };

  const handleSetDefaultAddress = async (id: number) => {
    setCurrent(id);
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
        {loading ? (
          <div className="w-full min-h-[30vh] flex items-center justify-center">
            <Spinner className='text-[var(--color-primary)] size-14'/>
          </div>
        ) : activeTab === "list" ? (
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
