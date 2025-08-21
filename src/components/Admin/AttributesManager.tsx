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
import type { Attribute } from '@/types'
import { api } from '@/services/api'
import { toast } from 'sonner'

const attributeFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  value: z.string().min(1, 'El valor es requerido'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'El color debe ser un código hexadecimal válido')
})

export const AttributesManager = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof attributeFormSchema>>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      name: '',
      value: '',
      color: '#000000'
    }
  })

  const fetchAttributes = async () => {
    try {
      const response = await api.get<Attribute[]>('attributes')
      setAttributes(response)
    } catch (error) {
      console.error('Error fetching attributes:', error)
      toast.error('Error al cargar los atributos')
    }
  }

  useEffect(() => {
    fetchAttributes()
  }, [])

  const handleSubmit = async (values: z.infer<typeof attributeFormSchema>) => {
    setIsLoading(true)
    try {
      if (isEditing && selectedAttribute) {
        console.log('Updating attribute:', values)
        await api.put(`attributes/${selectedAttribute.id}`, {
          ...values
        })
        toast.success('Atributo actualizado correctamente')
      } else {
        await api.post('attributes', {
          ...values
        })
        toast.success('Atributo creado correctamente')
      }
      await fetchAttributes()
      form.reset({
        name: '',
        value: '',
        color: '#000000'
      })
      setIsEditing(false)
      setSelectedAttribute(null)
    } catch (error) {
      console.error('Error submitting attribute:', error)
      toast.error(isEditing ? 'Error al actualizar el atributo' : 'Error al crear el atributo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (attribute: Attribute) => {
    setSelectedAttribute(attribute)
    if (attribute) {
      form.reset({
        name: attribute.name,
        value: attribute.value,
        color: attribute.color
      })
      setIsEditing(true)
    }
    form.reset({
      name: attribute.name,
      value: attribute.value,
      color: attribute.color
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este atributo?')) return
    
    setIsLoading(true)
    try {
      await api.delete(`attributes/${id}`)
      toast.success('Atributo eliminado correctamente')
      await fetchAttributes()
    } catch (error) {
      console.error('Error deleting attribute:', error)
      toast.error('Error al eliminar el atributo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h3 className="px-4 text-xl font-semibold">Lista de Atributos</h3>

      <div className="p-2 space-y-4 flex gap-4 flex-col lg:flex-row">
        <div className='w-full mb-0'>
          <DataList<Attribute>
            items={attributes}
            selectedId={selectedAttribute?.id?.toString()}
            onSelect={handleEdit}
            onDelete={async (id) => handleDelete(Number(id))}
            keyExtractor={(attribute) => attribute.id.toString()}
            className="h-full"
            renderItem={(attribute) => (
              <div className="space-y-2" style={{ borderColor: attribute.color }}>
                <h4 className="font-medium">{attribute.name}</h4>
                <p className="text-sm text-[var(--color-text)]/70">{attribute.value}</p>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: attribute.color }}></div>
                  <span className="text-sm">{attribute.color}</span>
                </div>
              </div>
            )}
            emptyListComponent={
              <div className="text-center p-4 text-[var(--color-text)]/70">
                No hay atributos disponibles
              </div>
            }
          />
        </div>

        <div className="bg-[var(--color-surface)]/80 p-4 rounded-lg w-full flex flex-col gap-2">
          <h2 className="text-2xl font-bold">{isEditing ? 'Editar Atributo' : 'Nuevo Atributo'}</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del atributo" className='bg-transparent dark:bg-transparent' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input placeholder="Valor del atributo" className='bg-transparent dark:bg-transparent' {...field} />
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
                      <Input type="color" className='bg-transparent dark:bg-transparent' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className='flex gap-2 w-full justify-end'>
                {isEditing && (
                  <Button
                    variant="secondary"
                    disabled={isLoading}
                    onClick={() => {
                      form.reset({
                        name: '',
                        value: '',
                        color: '#000000'
                      });
                      setIsEditing(false);
                      setSelectedAttribute(null);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : isEditing ? (
                    'Actualizar Atributo'
                  ) : (
                    'Crear Atributo'
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
