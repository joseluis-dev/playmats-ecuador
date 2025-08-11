import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { PlusIcon, Trash2Icon, PencilIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { api } from '@/services/api'
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Category, Attribute, Product } from '@/types'

const productFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  isCustomizable: z.boolean(),
  categories: z.array(z.string()),
  attributes: z.array(z.string()),
  resources: z.array(z.string())
})

export const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchProducts = async () => {
    try {
      const data = await api.get('products')
      console.log(data)
      setProducts(data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await api.get('categories')
      setCategories(data)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    }
  }

  const fetchAttributes = async () => {
    try {
      const data = await api.get('attributes')
      setAttributes(data)
    } catch (error) {
      console.error('Error al cargar atributos:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchAttributes()
  }, [])

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      isCustomizable: false,
      categories: [],
      attributes: [],
      resources: []
    }
  })

  const handleSubmit = async (values: z.infer<typeof productFormSchema>) => {
    const newProduct = {
      name: values.name,
      description: values.description,
      price: values.price,
      isCustomizable: values.isCustomizable,
    }
    // return
    setIsLoading(true)
    try {
      if (isEditing && selectedProduct) {
        await api.put(`products/${selectedProduct.id}`, newProduct)
        toast.success('Producto actualizado correctamente')
      } else {
        await api.post('products', newProduct)
        toast.success('Producto creado correctamente')
      }
      form.reset({
        name: '',
        description: '',
        price: 0,
      })
      setIsEditing(false)
      setSelectedProduct(null)
      fetchProducts()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (product: Product) => {
    try {
      setIsLoading(true)
      const productData = await api.get(`products/${product.id}`)
      setSelectedProduct(productData)
      setIsEditing(true)
      form.reset({
        name: productData.name,
        description: productData.description || '',
        price: productData.price || 0,
        isCustomizable: productData.isCustomizable || false,
        categories: productData.categories?.map((c: any) => String(c.id)) || [],
        attributes: productData.attributes?.map((a: any) => String(a.id)) || [],
        resources: productData.resources?.map((r: any) => String(r.id)) || []
      })
    } catch (error) {
      console.error('Error al cargar el producto:', error)
      toast.error('Error al cargar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!window.confirm('¿Está seguro que desea eliminar este producto?')) {
      return
    }
    
    try {
      setIsLoading(true)
      await api.delete(`products/${productId}`)
      toast.success('Producto eliminado correctamente')
      fetchProducts()
    } catch (error) {
      console.error('Error al eliminar el producto:', error)
      toast.error('Error al eliminar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Lista de productos */}
      <div className="bg-[var(--color-surface)]/80 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Productos</h2>
          <Button onClick={() => setIsEditing(false)} variant="default" size="sm">
            <PlusIcon className="w-4 h-4" />
            Nuevo Producto
          </Button>
        </div>

        <div className="space-y-2">
          {products.map(product => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-md"
            >
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-[var(--color-text)]/70">
                  ${product.price} - {product.isCustomizable ? 'Personalizable' : 'No personalizable'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(product)}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
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
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
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

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} placeholder="0.00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isCustomizable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Personalizable
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorías</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      {categories.map(category => (
                        <label key={category.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={field.value.includes(String(category.id))}
                            onCheckedChange={(checked) => {
                              const value = String(category.id)
                              if (checked) {
                                field.onChange([...field.value, value])
                              } else {
                                field.onChange(field.value.filter((v: string) => v !== value))
                              }
                            }}
                          />
                          {category.name}
                        </label>
                      ))}
                    </div>
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
                    setSelectedProduct(null)
                    form.reset()
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading 
                  ? 'Guardando...'
                  : isEditing 
                    ? 'Guardar Cambios' 
                    : 'Crear Producto'
                }
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
