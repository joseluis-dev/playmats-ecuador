import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useMemo } from "react"

const shippingAddressSchema = z.object({
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

type CountryOption = { id: number; nombre: string, states: StateOption[] }
type StateOption = { id: number; nombre: string; country_id: number }

interface ShippingAddressFormProps {
  onSave: (address: z.infer<typeof shippingAddressSchema>) => void;
  countries: CountryOption[];
  states: StateOption[];
}

export interface FormValues extends z.infer<typeof shippingAddressSchema> {}

export const ShippingAddressForm = ({ onSave, countries, states }: ShippingAddressFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullname: "",
      phone: "",
      country: '',
      state: '',
      city: "",
      postalCode: "",
      addressOne: "",
      addressTwo: "",
      current: false,
    },
  })

  function onSubmit(values: z.infer<typeof shippingAddressSchema>) {
    onSave && onSave(values)
    form.reset({
      fullname: "",
      phone: "",
      country: '',
      state: '',
      city: "",
      postalCode: "",
      addressOne: "",
      addressTwo: "",
      current: false,
    })
  }

  // Obtener el país seleccionado
  const selectedCountry = form.watch("country");
  const availableStates = useMemo(() => {
    if (!selectedCountry) return []
    const cid = Number(selectedCountry)
    return countries.find(c => c.id === cid)?.states
  }, [selectedCountry, states])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)]">Nombre Completo</Label>
                  <Input  placeholder="Nombre Completo" {...field} className="bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none"/>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)]">Teléfono</Label>
                  <Input type="tel" placeholder="Ej. 0999999999" {...field} className="bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none"/>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)]">Ciudad</Label>
                  <Input placeholder="Ciudad" {...field} className="bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none"/>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)]">Código Postal</Label>
                  <Input placeholder="Código Postal" {...field} className="bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none"/>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="addressOne"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)]">Dirección Principal</Label>
                  <Input placeholder="Calle Principal" {...field} className="bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none"/>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="addressTwo"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)]">Dirección Secundaria</Label>
                  <Input placeholder="Calle Secundaria" {...field} className="bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 dark:outline-none"/>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="current"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Checkbox id="current" checked={field.value} onCheckedChange={field.onChange} />
                  <Label htmlFor="current" className="text-[var(--color-text)]">Usar como dirección de envío actual</Label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="text-[var(--color-text)] w-full">Guardar</Button>
      </form>
    </Form>
  )
}
