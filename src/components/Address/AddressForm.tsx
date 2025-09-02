import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Address } from "./AddressesClerk";

// Esquema de validación para el formulario
const addressSchema = z.object({
  id: z.number().optional(),
  fullname: z.string().min(1, "El nombre completo es requerido"),
  phone: z.string().min(7, "El teléfono es requerido"),
  country: z.string().min(1, "El país es requerido"),
  state: z.string().min(1, "La provincia/estado es requerido"),
  city: z.string().min(1, "La ciudad es requerida"),
  postal_code: z.string().min(1, "El código postal es requerido"),
  address_one: z.string().min(1, "La dirección principal es requerida"),
  address_two: z.string().optional(),
  current: z.boolean(),
});

// Datos de ejemplo para los selectores
const countries = [
  { id: "1", name: "Ecuador" },
  { id: "2", name: "Colombia" },
  { id: "3", name: "Perú" }
];

const states = {
  "1": [ // Ecuador
    { id: "1", name: "Pichincha" },
    { id: "2", name: "Guayas" },
    { id: "3", name: "Azuay" },
    { id: "4", name: "Tungurahua" }
  ],
  "2": [ // Colombia
    { id: "5", name: "Cundinamarca" },
    { id: "6", name: "Antioquia" }
  ],
  "3": [ // Perú
    { id: "7", name: "Lima" },
    { id: "8", name: "Arequipa" }
  ]
};

interface AddressFormProps {
  initialData: Address | null;
  onSave: (address: Address) => void;
}

export const AddressForm = ({ initialData, onSave }: AddressFormProps) => {
  // Configuración del formulario
  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      id: initialData?.id,
      fullname: initialData?.fullname || "",
      phone: initialData?.phone || "",
      country: initialData?.country || "",
      state: initialData?.state || "",
      city: initialData?.city || "",
      postal_code: initialData?.postal_code || "",
      address_one: initialData?.address_one || "",
      address_two: initialData?.address_two || "",
      current: initialData?.current || false,
    },
  });

  // Si los datos iniciales cambian, actualizamos el formulario
  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        fullname: initialData.fullname,
        phone: initialData.phone,
        country: initialData.country,
        state: initialData.state,
        city: initialData.city,
        postal_code: initialData.postal_code,
        address_one: initialData.address_one,
        address_two: initialData.address_two,
        current: initialData.current,
      });
    }
  }, [initialData, form]);

  // Manejador de envío del formulario
  function onSubmit(values: z.infer<typeof addressSchema>) {
    onSave(values as Address);
  }

  // Obtener el país seleccionado
  const selectedCountry = form.watch("country");
  
  // Filtrar estados según el país seleccionado
  const availableStates = selectedCountry 
    ? states[selectedCountry as keyof typeof states] || []
    : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Campos ocultos */}
        {initialData?.id && (
          <input type="hidden" name="id" value={initialData.id} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre completo */}
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-col gap-2">
                    <Label className="text-[var(--color-text)] text-sm">Nombre Completo</Label>
                    <Input  
                      placeholder="Nombre Completo" 
                      {...field} 
                      className="bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Teléfono */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-col gap-2">
                    <Label className="text-[var(--color-text)] text-sm">Teléfono</Label>
                    <Input 
                      type="tel" 
                      placeholder="Ej. 0999999999" 
                      {...field} 
                      className="bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* País */}
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-col gap-2">
                    <Label className="text-[var(--color-text)] text-sm">País</Label>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none" >
                          <SelectValue placeholder="Seleccione el país" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estado/Provincia */}
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-col gap-2">
                    <Label className="text-[var(--color-text)] text-sm">Provincia/Estado</Label>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!selectedCountry}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none">
                          <SelectValue placeholder="Seleccione la provincia / estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableStates.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ciudad */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-col gap-2">
                    <Label className="text-[var(--color-text)] text-sm">Ciudad</Label>
                    <Input 
                      placeholder="Ciudad" 
                      {...field} 
                      className="bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Código postal */}
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-col gap-2">
                    <Label className="text-[var(--color-text)] text-sm">Código Postal</Label>
                    <Input 
                      placeholder="Código Postal" 
                      {...field} 
                      className="bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dirección principal */}
        <FormField
          control={form.control}
          name="address_one"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)] text-sm">Dirección Principal</Label>
                  <Input 
                    placeholder="Calle Principal" 
                    {...field} 
                    className="bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dirección secundaria */}
        <FormField
          control={form.control}
          name="address_two"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)] text-sm">Dirección Secundaria</Label>
                  <Input 
                    placeholder="Calle Secundaria" 
                    {...field} 
                    className="bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Checkbox para dirección predeterminada */}
        <FormField
          control={form.control}
          name="current"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="current" 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                  <Label 
                    htmlFor="current" 
                    className="text-[var(--color-text)] text-sm"
                  >
                    Usar como dirección de envío predeterminada
                  </Label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botón de guardar */}
        <Button 
          type="submit" 
          className="bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:bg-[var(--color-accent)]/90 w-full"
        >
          {initialData ? "Actualizar Dirección" : "Guardar Dirección"}
        </Button>
      </form>
    </Form>
  );
};
