import { useEffect, useMemo, useState } from "react";
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
import type { ShippingAddress } from "@/types";
import type { FormValues } from "../Payment/ShippingAddressForm";

// Esquema de validación para el formulario
const addressSchema = z.object({
  id: z.number().optional(),
  fullname: z.string().min(1, "El nombre completo es requerido"),
  phone: z.string().min(7, "El teléfono es requerido"),
  country: z.string().min(1, "El país es requerido"),
  state: z.string().min(1, "La provincia/estado es requerido"),
  city: z.string().min(1, "La ciudad es requerida"),
  postalCode: z.string().min(1, "El código postal es requerido"),
  addressOne: z.string().min(1, "La dirección principal es requerida"),
  addressTwo: z.string().optional(),
  current: z.boolean(),
});

// Datos desde API
type CountryOption = { id: number; nombre: string, states: StateOption[] }
type StateOption = { id: number; nombre: string; country_id: number }

interface AddressFormProps {
  initialData: ShippingAddress | null;
  onSave: (address: FormValues) => void;
  countries: CountryOption[];
  states: StateOption[];
}

export const AddressForm = ({ initialData, onSave, countries, states }: AddressFormProps) => {
  // Configuración del formulario
  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      id: initialData?.id,
      fullname: initialData?.fullname || "",
      phone: initialData?.phone || "",
      country: initialData?.country ? countries.find(c => c.nombre === initialData.country)?.id.toString() || "" : "",
      state: initialData?.state ? states.find(s => s.nombre === initialData.state)?.id.toString() || "" : "",
      city: initialData?.city || "",
      postalCode: initialData?.postalCode || "",
      addressOne: initialData?.addressOne || "",
      addressTwo: initialData?.addressTwo || "",
      current: initialData?.current || false,
    },
  });

  // Si los datos iniciales cambian, actualizamos el formulario
  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        fullname: initialData.fullname || "",
        phone: initialData.phone || "",
        country: initialData.country ? countries.find(c => c.nombre === (typeof initialData.country === "string" ? initialData.country : (initialData.country as any).nombre))?.id.toString() || "" : "",
        state: initialData.state ? states.find(s => s.nombre === (typeof initialData.state === "string" ? initialData.state : (initialData.state as any).nombre))?.id.toString() || "" : "",
        city: initialData.city || "",
        postalCode: initialData.postalCode || "",
        addressOne: initialData.addressOne || "",
        addressTwo: initialData.addressTwo || "",
        current: initialData.current || false,
      });
    }
  }, [initialData, form]);

  // If initial values are names (not IDs), map them to IDs once options are loaded
  useEffect(() => {
    const currentCountry = form.getValues('country')
    if (currentCountry && isNaN(Number(currentCountry))) {
      const match = countries.find(c => c.nombre === currentCountry)
      if (match) form.setValue('country', String(match.id))
    }
    const currentState = form.getValues('state')
    if (currentState && isNaN(Number(currentState))) {
      const match = states.find(s => s.nombre === currentState)
      if (match) form.setValue('state', String(match.id))
    }
  }, [countries, states])

  // Manejador de envío del formulario
  function onSubmit(values: z.infer<typeof addressSchema>) {
    onSave(values as FormValues);
  }

  // Obtener el país seleccionado
  const selectedCountry = form.watch("country");
  const availableStates = useMemo(() => {
    if (!selectedCountry) return []
    const cid = Number(selectedCountry)
    console.log(countries.find(c => c.id === cid))
    return countries.find(c => c.id === cid)?.states
  }, [selectedCountry, states])

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
                        <SelectTrigger className="w-full z-[100000] bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none" >
                        <SelectValue placeholder="Seleccione el país" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries && countries.map((country) => (
                          <SelectItem key={country.id} value={String(country.id)}>
                            {country.nombre}
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
                        <SelectTrigger className="w-full z-[100000] bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none">
                          <SelectValue placeholder="Seleccione la provincia / estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableStates && availableStates.map((state) => (
                          <SelectItem key={state.id} value={String(state.id)}>
                            {state.nombre}
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
            name="postalCode"
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
          name="addressOne"
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
          name="addressTwo"
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
          className="text-[var(--color-text)] w-full"
        >
          {initialData ? "Actualizar Dirección" : "Guardar Dirección"}
        </Button>
      </form>
    </Form>
  );
};
