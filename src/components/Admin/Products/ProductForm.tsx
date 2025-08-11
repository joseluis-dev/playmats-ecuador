import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUploader } from '@/components/Admin/Products/ImageUploader'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { api } from '@/services/api'
import type { Product, Category, Attribute, Resource } from '@/types'

const productFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  isCustomizable: z.boolean(),
  categories: z.array(z.string()),
  attributes: z.array(z.string()),
  resources: z.array(z.string())
})

interface ProductFormProps {
  product?: Product | null
  onSave: (data: z.infer<typeof productFormSchema>) => Promise<void>
}

export const ProductForm = ({ product, onSave }: ProductFormProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      isCustomizable: product?.isCustomizable || false,
      categories: product?.categories?.map(c => String(c.id)) || [],
      attributes: product?.attributes?.map(a => String(a.id)) || [],
      resources: product?.resources?.map(r => String(r.id)) || []
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [categoriesData, attributesData, resourcesData] = await Promise.all([
          api.get('categories'),
          api.get('attributes'),
          api.get('resources')
        ])
        setCategories(categoriesData)
        setAttributes(attributesData)
        setResources(resourcesData)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || '',
        price: product.price || 0,
        isCustomizable: product.isCustomizable || false,
        categories: product.categories?.map(c => String(c.id)) || [],
        attributes: product.attributes?.map(a => String(a.id)) || [],
        resources: product.resources?.map(r => String(r.id)) || []
      })
    }
  }, [product, form])

  const handleSubmit = async (values: z.infer<typeof productFormSchema>) => {
    console.log(values)
    await onSave(values)
    form.reset({
      name: '',
      description: '',
      price: 0,
      isCustomizable: false,
      categories: [],
      attributes: [],
      resources: []
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nombre del producto" />
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
                    <Input {...field} placeholder="Descripción del producto" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isCustomizable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Personalizable</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[var(--color-surface)]/70">
            <TabsTrigger value="images">Imágenes</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="attributes">Atributos</TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ImageUploader
                value={form.watch('resources')}
                onChange={(ids) => form.setValue('resources', ids)}
                resources={resources}
                onUpload={async (file) => {
                  try {
                    setIsLoading(true)
                    const formData = new FormData()
                    formData.append('file', file)
                    const response = await api.post('resources', formData)
                    setResources(prev => [...prev, response])
                    return response.id
                  } catch (error) {
                    console.error('Error al subir imagen:', error)
                    throw error
                  } finally {
                    setIsLoading(false)
                  }
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {categories.map(category => (
                <label key={category.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={form.watch('categories').includes(String(category.id))}
                    onCheckedChange={(checked) => {
                      const current = form.watch('categories')
                      const value = String(category.id)
                      if (checked) {
                        form.setValue('categories', [...current, value])
                      } else {
                        form.setValue('categories', current.filter(v => v !== value))
                      }
                    }}
                  />
                  <span className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attributes" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {attributes.map(attribute => (
                <label key={attribute.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={form.watch('attributes').includes(String(attribute.id))}
                    onCheckedChange={(checked) => {
                      const current = form.watch('attributes')
                      const value = String(attribute.id)
                      if (checked) {
                        form.setValue('attributes', [...current, value])
                      } else {
                        form.setValue('attributes', current.filter(v => v !== value))
                      }
                    }}
                  />
                  <span className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: attribute.color }}
                    />
                    {attribute.name}
                  </span>
                </label>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Guardando...'
              : product
                ? 'Guardar Cambios'
                : 'Crear Producto'
            }
          </Button>
        </div>
      </form>
    </Form>
  )
}
