import { useState } from "react";
import { AddressList } from "./AddressList";
import { AddressForm } from "./AddressForm";

// Interfaces para manejo de datos
export interface Address {
  id?: number;
  fullname: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  address_one: string;
  address_two?: string;
  current: boolean;
}

// Datos de ejemplo para visualización
const mockAddresses: Address[] = [
  {
    id: 1,
    fullname: "Juan Pérez",
    phone: "0987654321",
    country: "Ecuador",
    state: "Pichincha",
    city: "Quito",
    postal_code: "170150",
    address_one: "Av. 10 de Agosto y Colón",
    address_two: "Edificio Torres, Piso 5",
    current: true
  },
  {
    id: 2,
    fullname: "María López",
    phone: "0998765432",
    country: "Ecuador",
    state: "Guayas",
    city: "Guayaquil",
    postal_code: "090150",
    address_one: "Av. 9 de Octubre y Boyacá",
    current: false
  },
  {
    id: 3,
    fullname: "Carlos Sánchez",
    phone: "0981234567",
    country: "Ecuador",
    state: "Azuay",
    city: "Cuenca",
    postal_code: "010150",
    address_one: "Av. Solano y Calle Larga",
    address_two: "Edificio Plaza, Piso 2",
    current: false
  },
  {
    id: 4,
    fullname: "Ana Torres",
    phone: "0976543210",
    country: "Ecuador",
    state: "Tungurahua",
    city: "Ambato",
    postal_code: "180150",
    address_one: "Av. Cevallos y Calle Sucre",
    address_two: "Edificio Jardines, Piso 1",
    current: false
  }
];

export const AddressesClerk = () => {
  // Estados para gestionar la interfaz
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [activeTab, setActiveTab] = useState<"list" | "form">("list");
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Manejadores de eventos (mock, sin conexión a API)
  const handleAddAddress = () => {
    setEditingAddress(null);
    setActiveTab("form");
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setActiveTab("form");
  };

  const handleSaveAddress = (address: Address) => {
    if (address.id) {
      // Actualizar dirección existente
      setAddresses(prevAddresses => 
        prevAddresses.map(addr => 
          addr.id === address.id ? address : addr
        )
      );
    } else {
      // Crear nueva dirección con ID simulado
      const newAddress = {
        ...address,
        id: Math.max(0, ...addresses.map(addr => addr.id || 0)) + 1
      };
      setAddresses(prevAddresses => [...prevAddresses, newAddress]);
    }
    
    setActiveTab("list");
    setEditingAddress(null);
  };

  const handleDeleteAddress = (id: number) => {
    setAddresses(prevAddresses => 
      prevAddresses.filter(addr => addr.id !== id)
    );
  };

  const handleSetDefaultAddress = (id: number) => {
    setAddresses(prevAddresses => 
      prevAddresses.map(addr => ({
        ...addr,
        current: addr.id === id
      }))
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-4">
      <div className="border-b border-gray-200 h-10">
        <h1 className="font-bold text-[17px]">Direcciones de Envío</h1>
      </div>
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
          />
        )}
      </div>
    </div>
  );
};
