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
import { useEffect, useState } from "react"
import { orderService } from "@/services/orderService"
import { useCart } from "@/hooks/useCart"
import type { ShippingAddress } from "@/types"
import { toast } from "sonner"
import { Spinner } from "../ui/spinner"

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
  const [loading, setLoading] = useState(false)
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comprobante: undefined,
      shippingAddress: selected ?? null,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!cart) return
    setLoading(true)
    try {
      await orderService.createFromCart(cart, values)
      await clearCart()
      form.reset({
        comprobante: undefined,
        shippingAddress: selected ?? null,
      })
      window.location.assign('/orders')
      toast.success("Orden creada correctamente")
    } catch (error) {
      console.error("Error al crear la orden:", error)
      toast.error("Error al crear la orden")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selected && typeof selected.id === "number") {
      form.setValue("shippingAddress", selected)
    }
  }, [selected])

  return (
    <Form {...form}>
      {loading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 grid place-items-center select-none rounded-md">
          <Spinner className='text-[var(--color-primary)] size-14'/>
        </div>
      )}
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
