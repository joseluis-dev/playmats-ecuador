import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type ControllerRenderProps } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Image } from "@unpic/react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Upload, X } from "lucide-react"
import { useRef, useState } from "react"

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
  const [url, setUrl] = useState<string | null>(null)
  const inputFileRef = useRef<HTMLInputElement>(null)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comprobante: undefined,
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: ControllerRenderProps<{ comprobante: File }, "comprobante">) => {
    const file = e.target.files?.[0]
    console.log(file)
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, field: ControllerRenderProps<{ comprobante: File }, "comprobante">) => {
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()

    if (inputFileRef.current) {
      inputFileRef.current.click()
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>,field: ControllerRenderProps<{ comprobante: File }, "comprobante">) => {
    e.preventDefault()
    e.stopPropagation()
    setUrl(null)
    field.onChange(undefined)
    if (inputFileRef.current) {
      inputFileRef.current.value = ""
    }
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
                <div
                  className="border-1 border-dashed border-[var(--color-text)] rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/80 dark:hover:border-blue-400 transition-all duration-200 ease-in-out h-96"
                  onClick={(e) => handleClick(e)}
                  onDrop={(e) => handleDrop(e, field)}
                  onDragOver={handleDragOver}
                >
                  {url ? (
                    <picture className="relative w-full h-full">
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-[var(--color-primary)]/80 p-2 rounded-full hover:bg-[var(--color-primary)]/100 transition-all duration-200 ease-in-out cursor-pointer"
                        onClick={(e) => {
                          handleRemoveImage(e, field)
                        }}
                      >
                        <X width={16} height={16}/>
                      </button>
                      <Image
                        src={url}
                        alt="Preview"
                        width={100}
                        height={300}
                        className="w-full h-full object-contain rounded-md"
                      />
                    </picture>
                  ) : (
                    <>
                      <span className="bg-[var(--color-surface)] p-2 rounded-full mb-4">
                        <Upload />
                      </span>
                      <p className="mb-1">Arrastra y suelta tu comprobante aquí</p>
                      <p className="text-sm text-[var(--color-text)]/70 mb-1">o haz clic para seleccionar un archivo</p>
                      <p className="text-sm text-[var(--color-text)]/70 mb-1">Formatos soportados: JPG, PNG, PDF (máx. 5MB)</p>
                    </>
                  )}
                  <Input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleChange(e, field)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={inputFileRef}
                  />
                </div>
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
