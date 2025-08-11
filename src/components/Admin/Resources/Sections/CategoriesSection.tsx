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
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

// Define the Category type
interface Category {
  id: number
  name: string
  description: string
}

// Define form schema
const categoryFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
});

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    // TODO: Implement fetch categories from API
    setIsLoading(false)
  }, [])

  const handleSubmit = (values: z.infer<typeof categoryFormSchema>) => {
    if (isEditing && selectedCategory) {
      // TODO: Actualizar categoría existente
    } else {
      // TODO: Crear nueva categoría
    }
    form.reset()
    setIsEditing(false)
    setSelectedCategory(null)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsEditing(true)
    form.reset({
      name: category.name || "",
      description: category.description || "",
    })
  }

  const handleDelete = async (categoryId: number) => {
    // TODO: Implementar eliminación
  }

  if (isLoading) {
    return <div>Cargando categorías...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Lista de categorías */}
      <div className="bg-[var(--color-surface)]/80 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Categorías</h2>
          <Button onClick={() => setIsEditing(false)} variant="default" size="sm">
            <PlusIcon className="w-4 h-4" />
            Nueva Categoría
          </Button>
        </div>

        <div className="space-y-2">
          {categories.length === 0 ? (
            <div className="text-center py-4 text-[var(--color-text)]/70">
              No hay categorías disponibles
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-md"
              >
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-[var(--color-text)]/70">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
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
          {isEditing ? "Editar Categoría" : "Nueva Categoría"}
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
                    <Input {...field} placeholder="Nombre de la categoría" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Descripción de la categoría" />
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
                    setSelectedCategory(null)
                    form.reset()
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit">
                {isEditing ? "Guardar Cambios" : "Crear Categoría"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
