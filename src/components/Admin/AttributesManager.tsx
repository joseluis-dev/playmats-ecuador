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
import type { Attribute } from '@/types'

const attributeFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  value: z.string().min(1, 'El valor es requerido'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'El color debe ser un código hexadecimal válido')
})

export const AttributesManager = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<z.infer<typeof attributeFormSchema>>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      name: '',
      value: '',
      color: '#000000'
    }
  })

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
      name: attribute.name || '',
      value: attribute.value || '',
      color: attribute.color || '#000000'
    })
  }

  const handleDelete = async (attributeId: number) => {
    // TODO: Implementar eliminación
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
          {attributes.map(attribute => (
            <div
              key={attribute.id}
              className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-md"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: attribute.color }}
                />
                <div>
                  <h3 className="font-medium">{attribute.name}</h3>
                  <p className="text-sm text-[var(--color-text)]/70">
                    {attribute.value}
                  </p>
                </div>
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
          ))}
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-[var(--color-surface)]/80 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Editar Atributo' : 'Nuevo Atributo'}
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
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Valor del atributo" />
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
                    setSelectedAttribute(null)
                    form.reset()
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit">
                {isEditing ? 'Guardar Cambios' : 'Crear Atributo'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
