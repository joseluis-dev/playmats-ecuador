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
import type { Attribute } from '@/types'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold tracking-tight">Atributos</h3>
        <p className="text-sm text-muted-foreground">Define atributos y valores que enriquecen tus productos y recursos.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lista</CardTitle>
            <CardDescription>{attributes.length} atributo{attributes.length === 1 ? '' : 's'}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataList<Attribute>
              className='max-h-[300px] overflow-y-auto'
              items={attributes}
              selectedId={selectedAttribute?.id?.toString()}
              onSelect={handleEdit}
              onDelete={async (id) => handleDelete(Number(id))}
              keyExtractor={(attribute) => attribute.id.toString()}
              renderItem={(attribute) => (
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">{attribute.id} - {attribute.name}</h4>
                  <p className="text-xs text-muted-foreground">{attribute.value}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: attribute.color }}></div>
                    <span className="text-muted-foreground">{attribute.color}</span>
                  </div>
                </div>
              )}
              emptyListComponent={<div className="text-center p-6 text-muted-foreground">No hay atributos disponibles</div>}
            />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden w-full flex flex-col gap-2">
          {isLoading && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 grid place-items-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/40 border-top-primary"></div>
            </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{isEditing ? 'Editar atributo' : 'Nuevo atributo'}</CardTitle>
            <CardDescription>Nombre, valor y color para identificar el atributo.</CardDescription>
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
                        <Input placeholder="Nombre del atributo" className='bg-background' {...field} />
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
                        <Input placeholder="Valor del atributo" className='bg-background' {...field} />
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
                      variant="outline"
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
                  <Button type="submit" disabled={isLoading} className='text-[var(--color-text)]'>
                    {isEditing ? 'Actualizar Atributo' : 'Crear Atributo'}
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
