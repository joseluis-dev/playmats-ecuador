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

// Define the Attribute type
interface Attribute {
  id: number
  name: string
  type: 'text' | 'number' | 'select' | 'color'
  options?: string[]
}

// Define form schema
const attributeTypes = ['text', 'number', 'select', 'color'] as const;

const attributeFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(attributeTypes).default('text'),
  options: z.string().optional(),
});

export default function AttributesSection() {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null)

  const form = useForm({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      name: "",
      type: "text",
      options: "",
    },
  });

  useEffect(() => {
    // TODO: Implement fetch attributes from API
    setIsLoading(false)
  }, [])

  const handleSubmit = (values: z.infer<typeof attributeFormSchema>) => {
    if (isEditing && selectedAttribute) {
      // TODO: Actualizar atributo existente
    } else {
      // TODO: Crear nuevo atributo
    }
    form.reset()
    setIsEditing(false)
    setSelectedAttribute(null)
  }

  const handleEdit = (attribute: Attribute) => {
    setSelectedAttribute(attribute)
    setIsEditing(true)
    form.reset({
      name: attribute.name || "",
      type: attribute.type || "text",
      options: attribute.options?.join(", ") || "",
    })
  }

  const handleDelete = async (attributeId: number) => {
    // TODO: Implementar eliminación
  }

  if (isLoading) {
    return <div>Cargando atributos...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Lista de atributos */}
      <div className="bg-[var(--color-surface)]/80 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Atributos</h2>
          <Button onClick={() => setIsEditing(false)} variant="default" size="sm">
            <PlusIcon className="w-4 h-4" />
            Nuevo Atributo
          </Button>
        </div>

        <div className="space-y-2">
          {attributes.length === 0 ? (
            <div className="text-center py-4 text-[var(--color-text)]/70">
              No hay atributos disponibles
            </div>
          ) : (
            attributes.map((attribute) => (
              <div
                key={attribute.id}
                className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-md"
              >
                <div>
                  <h3 className="font-medium">{attribute.name}</h3>
                  <p className="text-sm text-[var(--color-text)]/70">
                    Tipo: {attribute.type}
                    {attribute.options && ` (${attribute.options.join(", ")})`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(attribute)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attribute.id)}
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
      <div className="bg-[var(--color-surface)]/80 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "Editar Atributo" : "Nuevo Atributo"}
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nombre del atributo" />
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
                      {attributeTypes.map((type) => (
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
              name="options"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opciones</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Opciones separadas por comas (solo para tipo 'select')"
                      disabled={form.watch("type") !== "select"}
                    />
                  </FormControl>
                  <FormMessage />
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
                    setSelectedAttribute(null)
                    form.reset()
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit">
                {isEditing ? "Guardar Cambios" : "Crear Atributo"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
