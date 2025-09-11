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
import { MultiImageUploader } from '@/components/Admin/Products/MultiImageUploader'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { api } from '@/services/api'
import type { Product, Category, Attribute, Resource } from '@/types'
import { MultiSelect } from '@/components/ui/multi-select'

const productFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  isCustomizable: z.boolean(),
  categories: z.array(z.string()),
  attributes: z.array(z.string()),
  resources: z.array(z.custom<Resource>())
})

interface ProductFormProps {
  product?: Product | null
  setProduct: (product: Product | null) => void
  onSave: (data: z.infer<typeof productFormSchema>) => Promise<void>
}

export const ProductForm = ({ product, setProduct, onSave }: ProductFormProps) => {
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
      resources: product?.resourceProducts?.map(r => r.resource) || []
    }
  })
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [categoriesDataResponse, attributesDataResponse] = await Promise.all([
          api.get('categories'),
          api.get('attributes')
        ])
        const categoriesData = categoriesDataResponse
        const attributesData = attributesDataResponse
        setCategories(categoriesData as Category[])
        setAttributes(attributesData as Attribute[])
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
      setResources(product.resourceProducts?.map(r => r.resource) || [])
      form.reset({
        name: product.name,
        description: product.description || '',
        price: product.price || 0,
        isCustomizable: product.isCustomizable || false,
        categories: product.categories?.map(c => String(c.id)) || [],
        attributes: product.attributes?.map(a => String(a.id)) || [],
        resources: product.resourceProducts?.map(r => r.resource) || []
      })
    }
  }, [product, form])

  const handleSubmit = async (values: z.infer<typeof productFormSchema>) => {
    await onSave(values)
    handleReset()
  }

  // Convertir las categorías y atributos al formato requerido por MultiSelect
  const categoryOptions = categories.map(c => ({
    id: c.id,
    name: c.name || '',
    color: c.color
  }))

  const attributeOptions = attributes.map(a => ({
    id: a.id,
    name: a.name || '',
    color: a.color
  }))

  const handleReset = () => {
    form.reset({
      name: '',
      description: '',
      price: 0,
      isCustomizable: false,
      categories: [],
      attributes: [],
      resources: []
    })
    setProduct(null)
    setResources([])
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-1">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Completa la información básica y adjunta recursos.</p>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} className='bg-background' placeholder="Nombre del producto" />
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
                    <Input {...field} className='bg-background' placeholder="Descripción del producto" />
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
                        className='bg-background'
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
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-6">
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

        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resources">Recursos</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="attributes">Atributos</TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 w-full">
              <FormLabel>Recursos</FormLabel>
              <MultiImageUploader
                value={form.watch('resources')}
                onChange={(items) => form.setValue('resources', items)}
                onUpload={async (file) => {
                  try {
                    setIsLoading(true)
                    const url = URL.createObjectURL(file)
                    const newResource = {
                      id: `${file.name}-${Date.now()}`,
                      name: file.name,
                      url: url,
                      thumbnail: url,
                      watermark: url,
                      hosting: "cloudinary",
                      type: 'IMAGE' as const,
                      isBanner: false,
                      file
                    }
                    setResources(prev => [...prev, newResource])
                    return newResource
                  } catch (error) {
                    console.error('Error al subir imagen:', error)
                    throw error
                  } finally {
                    setIsLoading(false)
                  }
                }}
                onRemove={(item) => {
                  const filtered = resources.filter(r => r.id.toString() !== item.id.toString())
                  form.setValue('resources', filtered)
                  setResources(filtered)
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorías</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={categoryOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Seleccionar categorías..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="attributes" className="space-y-4">
            <FormField
              control={form.control}
              name="attributes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atributos</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={attributeOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Seleccionar atributos..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          {product && (
            <Button onClick={() => handleReset()} variant="outline" type='button'>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading} className='text-[var(--color-text)]'>
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
