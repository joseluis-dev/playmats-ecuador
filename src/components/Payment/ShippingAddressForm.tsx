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

const shippingAddressSchema = z.object({
  user_id: z.string().uuid(),
  fullname: z.string().min(1, "El nombre completo es requerido"),
  phone: z.string().min(7, "El teléfono es requerido"),
  country_id: z.string(),
  state_id: z.string(),
  city: z.string().min(1, "La ciudad es requerida"),
  postal_code: z.string().min(1, "El código postal es requerido"),
  address_one: z.string().min(1, "La dirección principal es requerida"),
  address_two: z.string().optional(),
  current: z.boolean(),
});

export const ShippingAddressForm = () => {
  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      user_id: "b608ddca-ab7b-4f18-bcc4-31174f7fb5d6",
      fullname: "",
      phone: "",
      country_id: '0',
      state_id: '',
      city: "",
      postal_code: "",
      address_one: "",
      address_two: "",
      current: false,
    },
  })

  function onSubmit(values: z.infer<typeof shippingAddressSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="user_id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} className="hidden"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)]">Nombre Completo</Label>
                  <Input  placeholder="Nombre Completo" {...field} className="bg-[var(--color-surface)]/80 dark:bg-[var(--color-surface)]/80 dark:outline-none"/>
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
                  <Input type="tel" placeholder="Ej. 0999999999" {...field} className="bg-[var(--color-surface)]/80 dark:bg-[var(--color-surface)]/80 dark:outline-none"/>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country_id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)]">País</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                    <FormControl>
                      <SelectTrigger className="w-full bg-[var(--color-surface)]/80 dark:bg-[var(--color-surface)]/80 dark:outline-none" >
                        <SelectValue placeholder="Seleccione el país" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Ecuador</SelectItem>
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
          name="state_id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)]">Provincia/Estado</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-[var(--color-surface)]/80 dark:bg-[var(--color-surface)]/80 dark:outline-none">
                        <SelectValue placeholder="Seleccione la provincia / estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Tungurahua</SelectItem>
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
                  <Input placeholder="Ciudad" {...field} className="bg-[var(--color-surface)]/80 dark:bg-[var(--color-surface)]/80 dark:outline-none"/>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)]">Código Postal</Label>
                  <Input placeholder="Código Postal" {...field} className="bg-[var(--color-surface)]/80 dark:bg-[var(--color-surface)]/80 dark:outline-none"/>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address_one"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)]">Dirección Principal</Label>
                  <Input placeholder="Calle Principal" {...field} className="bg-[var(--color-surface)]/80 dark:bg-[var(--color-surface)]/80 dark:outline-none"/>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address_two"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Label className="text-[var(--color-text)]">Dirección Secundaria</Label>
                  <Input placeholder="Calle Secundaria" {...field} className="bg-[var(--color-surface)]/80 dark:bg-[var(--color-surface)]/80 dark:outline-none"/>
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
