import { useState } from 'react'
import { Button } from '../ui/button'
import { PlusIcon, Trash2Icon, PencilIcon } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Category } from '@/types'

const categoryFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'El color debe ser un código hexadecimal válido')
})

export const CategoriesManager = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#000000'
    }
  })

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
      name: category.name || '',
      description: category.description || '',
      color: category.color || '#000000'
    })
  }

  const handleDelete = async (categoryId: number) => {
    // TODO: Implementar eliminación
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
          {categories.map(category => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-md"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-[var(--color-text)]/70">
                    {category.description}
                  </p>
                </div>
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
          ))}
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-[var(--color-surface)]/80 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
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

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex gap-2 items-center">
                    <FormControl>
                      <Input {...field} type="color" className="w-12 h-12 p-1" />
                    </FormControl>
                    <Input 
                      {...field} 
                      placeholder="#000000"
                      className="flex-1"
                      onChange={(e) => {
                        const value = e.target.value
                        if (value.startsWith('#')) {
                          field.onChange(value)
                        } else {
                          field.onChange(`#${value}`)
                        }
                      }}
                    />
                  </div>
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
                {isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
