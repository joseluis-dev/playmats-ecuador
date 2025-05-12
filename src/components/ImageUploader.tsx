import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type ControllerRenderProps } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Upload } from "lucide-react"
import { useState } from "react"

const formSchema = z.object({
  comprobante: z
    .custom<File>((file) => file instanceof File && file.size > 0, {
      message: "Debes subir un comprobante",
    })
    .refine(file => file.type.startsWith("image/"), {
      message: "El archivo debe ser una imagen",
    })
})

export const ImageUploader = () => {
  const [url, setUrl] = useState<string | null>(null)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comprobante: undefined,
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: ControllerRenderProps<{ comprobante: File }, "comprobante">) => {
    const file = e.target.files?.[0]
    field.onChange(file)
    if (file) {
      // Validar con Zod antes de crear la URL
      const result = formSchema.shape.comprobante.safeParse(file)
      if (result.success) {
        const objectUrl = URL.createObjectURL(file)
        setUrl(objectUrl)
      } else {
        setUrl(null)
      }
    } else {
      setUrl(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>, field: ControllerRenderProps<{ comprobante: File }, "comprobante">) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files[0]
    field.onChange(file)
    if (file) {
      // Validar con Zod antes de crear la URL
      const result = formSchema.shape.comprobante.safeParse(file)
      if (result.success) {
        const objectUrl = URL.createObjectURL(file)
        setUrl(objectUrl)
      } else {
        setUrl(null)
      }
    } else {
      setUrl(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

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
                <label
                  className="border-1 border-dashed border-[var(--color-text)] rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/80 dark:hover:border-blue-400 transition-all duration-200 ease-in-out h-52"
                  onDrop={(e) => handleDrop(e, field)}
                  onDragOver={handleDragOver}
                >
                  {url ? (
                    <img
                      src={url}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <>
                      <span className="bg-[var(--color-surface)] p-2 rounded-full mb-2">
                        <Upload />
                      </span>
                      <p className="text-sm mb-1">Arrastra y suelta tu comprobante aquí</p>
                      <p className="text-xs text-[var(--color-text)]/70 mb-1">o haz clic para seleccionar un archivo</p>
                      <p className="text-xs text-[var(--color-text)]/70 mb-1">Formatos soportados: JPG, PNG, PDF (máx. 5MB)</p>
                    </>
                  )}
                  <Input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleChange(e, field)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </label>
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
