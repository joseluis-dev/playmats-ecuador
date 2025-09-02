import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Address } from "./AddressesClerk";

interface AddressListProps {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
}

export const AddressList = ({ 
  addresses, 
  onEdit, 
  onDelete,
  onSetDefault 
}: AddressListProps) => {
  if (addresses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 p-3 rounded-full bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No tienes direcciones guardadas</h3>
        <p className="text-sm text-gray-500 mt-1">Agrega una dirección para tus envíos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <Card key={address.id} className={`overflow-hidden ${address.current ? 'border-blue-500 border-2' : ''}`}>
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{address.fullname}</h3>
                  <p className="text-sm text-gray-500">{address.phone}</p>
                </div>
                {address.current && (
                  <span className="text-xs font-medium py-1 px-2 bg-blue-100 text-blue-800 rounded-full">
                    Predeterminada
                  </span>
                )}
              </div>
              
              <p className="mt-2 text-sm text-gray-600">
                {address.address_one}
                {address.address_two && `, ${address.address_two}`},
                {` ${address.city}, ${address.state}`}
              </p>
              <p className="text-sm text-gray-600">
                {address.postal_code}, {address.country}
              </p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex justify-between items-center">
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(address)}
                >
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => address.id && onDelete(address.id)}
                >
                  Eliminar
                </Button>
              </div>
              {!address.current && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => address.id && onSetDefault(address.id)}
                >
                  Establecer como predeterminada
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
