import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImageUploader } from "@/components/ImageUploader"

// Define the Resource type
interface Resource {
  id: number
  name: string
  url: string
  thumbnail?: string
  watermark?: string
  hosting?: string
  type: "image" | "video"
  is_banner: boolean
}

// Define form schema
const resourceTypes = ["image", "video"] as const;

const resourceFormSchema = z.object({
  file: z.custom<File>((file) => file instanceof File && file.size > 0, {
    message: "Debes subir un comprobante",
  })
  .refine(file => file.type.startsWith("image/"), {
    message: "El archivo debe ser una imagen",
  }),
  type: z.enum(["image", "video"]).default("image"),
  is_banner: z.boolean().default(false),
});

export default function ResourcesSection() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      file: undefined,
      type: "image",
      is_banner: false,
    },
  })

  useEffect(() => {
    // TODO: Implement fetch resources from API
    setIsLoading(false)
  }, [])

  const handleSubmit = (values: z.infer<typeof resourceFormSchema>) => {
    if (isEditing && selectedResource) {
      // TODO: Actualizar recurso existente
    } else {
      // TODO: Crear nuevo recurso
    }
    form.reset()
    setIsEditing(false)
    setSelectedResource(null)
  }

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource)
    setIsEditing(true)
    form.reset({
      file: undefined,
      type: resource.type || "image",
      is_banner: resource.is_banner || false,
    })
  }

  const handleDelete = async (resourceId: number) => {
    // TODO: Implementar eliminación
  }

  if (isLoading) {
    return <div>Cargando recursos...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Lista de recursos */}
      <div className="bg-[var(--color-surface)]/70 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recursos</h2>
          <Button onClick={() => setIsEditing(false)} variant="default" size="sm">
            <PlusIcon className="w-4 h-4" />
            Nuevo Recurso
          </Button>
        </div>

        <div className="space-y-2">
          {resources.length === 0 ? (
            <div className="text-center py-4 text-[var(--color-text)]/70">
              No hay recursos disponibles
            </div>
          ) : (
            resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-md"
              >
                <div>
                  <h3 className="font-medium">{resource.name}</h3>
                  <p className="text-sm text-[var(--color-text)]/70">
                    {resource.type} {resource.is_banner ? "- Banner" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(resource)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(resource.id)}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-[var(--color-surface)]/70 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "Editar Recurso" : "Nuevo Recurso"}
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploader
                      field={field}
                      validator={resourceFormSchema.shape.file}
                      placeholderText={{
                        main: "Arrastra y suelta tu recurso aquí",
                        sub: "o haz clic para seleccionar un archivo",
                        formats: "Formatos soportados: JPG, PNG (máx. 5MB)"
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_banner"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Es banner</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false)
                    setSelectedResource(null)
                    form.reset()
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit">
                {isEditing ? "Guardar Cambios" : "Crear Recurso"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}