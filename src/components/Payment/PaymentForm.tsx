import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { ImageUploader } from "@/components/ImageUploader"
import { useAddress } from "@/hooks/useAddress"
import { useEffect } from "react"
import { orderService } from "@/services/orderService"
import { useCart } from "@/hooks/useCart"
import type { ShippingAddress } from "@/types"

const formSchema = z.object({
  comprobante: z
    .custom<File>((file) => file instanceof File && file.size > 0, {
      message: "Debes subir un comprobante",
    })
    .refine(file => file.type.startsWith("image/"), {
      message: "El archivo debe ser una imagen",
    }),
    shippingAddress: z.custom<ShippingAddress | null>((val) => {
      return val === null || (typeof val === 'object' && (val.id === undefined || typeof val.id === 'number'));
    }),
})

export interface PaymentFormValues extends z.infer<typeof formSchema> {}

export const PaymentForm = () => {
  const { selected } = useAddress()
  const { cart, clearCart } = useCart()
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comprobante: undefined,
      shippingAddress: selected ?? null,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Submitting with values:', values);
    await orderService.createFromCart(cart, values)
    await clearCart()
    form.reset({
      comprobante: undefined,
      shippingAddress: selected ?? null,
    })
    window.location.assign('/orders')
  }

  useEffect(() => {
    if (selected && typeof selected.id === "number") {
      form.setValue("shippingAddress", selected)
    }
  }, [selected])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="comprobante"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUploader
                  field={field}
                  validator={formSchema.shape.comprobante}
                  placeholderText={{
                    main: "Arrastra y suelta tu comprobante aquí",
                    sub: "o haz clic para seleccionar un archivo",
                    formats: "Formatos soportados: JPG, PNG (máx. 5MB)"
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="text-[var(--color-text)] w-full">
          Crear Orden
        </Button>
      </form>
    </Form>
  )
}
