import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { PlusIcon, Trash2Icon, PencilIcon } from 'lucide-react'
import { DataList } from '@/components/DataList'
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
import { api } from '@/services/api'
import { toast } from 'sonner'

const categoryFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'El color debe ser un código hexadecimal válido')
})

export const CategoriesManager = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#000000'
    }
  })

  const fetchCategories = async () => {
    try {
      const response = await api.get<Category[]>('categories')
      setCategories(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Error al cargar las categorías')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (values: z.infer<typeof categoryFormSchema>) => {
    console.log('Submitting category:', values)
    setIsLoading(true)
    try {
      if (isEditing && selectedCategory) {
        await api.put(`categories/${selectedCategory.id}`, {
          ...values,
        })
        toast.success('Categoría actualizada correctamente')
      } else {
        await api.post('categories', {
          ...values
        })
        toast.success('Categoría creada correctamente')
      }
      await fetchCategories()
      form.reset({
        name: '',
        description: '',
        color: '#000000'
      })
      setIsEditing(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error('Error submitting category:', error)
      toast.error(isEditing ? 'Error al actualizar la categoría' : 'Error al crear la categoría')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    form.reset({
      name: category.name,
      description: category.description,
      color: category.color
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta categoría?')) return
    
    setIsLoading(true)
    try {
      await api.delete(`categories/${id}`)
      toast.success('Categoría eliminada correctamente')
      await fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Error al eliminar la categoría')
    } finally {
      setIsLoading(false)
      form.reset({
        name: '',
        description: '',
        color: '#000000'
      })
    }
  }

  return (
    <>
      <h3 className="px-4 text-xl font-semibold">Lista de Categorías</h3>
      <div className="p-2 space-y-4 flex gap-4 flex-col lg:flex-row">
        <div className="w-full m-0">
          <DataList<Category>
            items={categories}
            selectedId={selectedCategory?.id?.toString()}
            onSelect={handleEdit}
            onDelete={async (id) => handleDelete(Number(id))}
            keyExtractor={(category) => category.id.toString()}
            className='h-full'
            renderItem={(category) => (
              <div className="space-y-2" style={{ borderColor: category.color }}>
                <h4 className="font-medium">{category.name}</h4>
                <p className="text-sm text-[var(--color-text)]/70">{category.description}</p>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <span className="text-sm">{category.color}</span>
                </div>
              </div>
            )}
            emptyListComponent={
              <div className="text-center p-4 text-[var(--color-text)]/70">
                No hay categorías disponibles
              </div>
            }
          />
        </div>

        <div className='flex flex-col p-4 gap-2 w-full bg-[var(--color-surface)]/80 rounded-lg'>
          <h2 className="text-2xl font-bold">Gestión de Categorías</h2>
        
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la categoría" {...field} />
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
                      <Input placeholder="Descripción de la categoría" {...field} />
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
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className='flex gap-2 w-full justify-end'>
                {isEditing && (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isLoading}
                    onClick={() => {
                      form.reset({
                        name: '',
                        description: '',
                        color: '#000000',
                      });
                      setIsEditing(false);
                      setSelectedCategory(null);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : isEditing ? (
                    'Actualizar Categoría'
                  ) : (
                    'Crear Categoría'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  )
}
