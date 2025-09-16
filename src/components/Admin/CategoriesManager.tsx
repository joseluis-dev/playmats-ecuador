import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
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
import { categoriesService } from '@/services/categoriesService'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

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
      const response = await categoriesService.list()
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
        await categoriesService.update(selectedCategory.id, values)
        toast.success('Categoría actualizada correctamente')
      } else {
        await categoriesService.create(values)
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
  await categoriesService.remove(id)
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold tracking-tight">Categorías</h3>
        <p className="text-sm text-muted-foreground">Crea, edita y organiza categorías para tus productos y recursos.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lista</CardTitle>
            <CardDescription>{categories.length} categoría{categories.length === 1 ? '' : 's'}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataList<Category>
              className='max-h-[300px] overflow-y-auto'
              items={categories}
              selectedId={selectedCategory?.id?.toString()}
              onSelect={handleEdit}
              onDelete={async (id) => handleDelete(Number(id))}
              keyExtractor={(category) => category.id.toString()}
              renderItem={(category) => (
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">{category.id} - {category.name}</h4>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: category.color }}></div>
                    <span className="text-muted-foreground">{category.color}</span>
                  </div>
                </div>
              )}
              emptyListComponent={<div className="text-center p-6 text-muted-foreground">No hay categorías disponibles</div>}
            />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 grid place-items-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/40 border-top-primary"></div>
            </div>
          )}
          <CardHeader className='pb-2'>
            <CardTitle className="text-lg">{isEditing ? 'Editar categoría' : 'Nueva categoría'}</CardTitle>
            <CardDescription>Define nombre, descripción y color.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de la categoría" className='bg-background' {...field} />
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
                        <Input placeholder="Descripción de la categoría" className='bg-background' {...field} />
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
                        <Input type="color" className='bg-background' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className='flex gap-2 w-full justify-end'>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
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
                  <Button type="submit" disabled={isLoading} className='text-[var(--color-text)]'>
                    {isEditing ? 'Actualizar Categoría' : 'Crear Categoría'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
