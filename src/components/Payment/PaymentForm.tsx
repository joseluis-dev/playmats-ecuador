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

const formSchema = z.object({
  comprobante: z
    .custom<File>((file) => file instanceof File && file.size > 0, {
      message: "Debes subir un comprobante",
    })
    .refine(file => file.type.startsWith("image/"), {
      message: "El archivo debe ser una imagen",
    })
})

export const PaymentForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comprobante: undefined,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

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
        <Button type="submit" className="text-[var(--color-text)] w-full">Subir comprobante</Button>
      </form>
    </Form>
  )
}
