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
import { Checkbox } from "@/components/ui/checkbox"
import { PencilIcon, Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImageUploader } from "@/components/ImageUploader"
import { DataList } from "@/components/DataList"
import { api } from "@/services/api"

// Define the Resource type
interface Resource {
  id: number
  name: string
  url: string
  thumbnail?: string
  watermark?: string
  hosting?: string
  type: "IMAGE" | "VIDEO"
  is_banner: boolean
}

const resourceFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  
  file: z.custom<File>((file) => file instanceof File && file.size > 0, {
      message: "Debes subir un archivo",
    })
    .refine(
      (file) =>
        file.type.startsWith("image/") ||
        file.type.startsWith("video/"),
      {
        message: "El archivo debe ser una imagen o un video",
      }
    ).optional(),
  is_banner: z.boolean().default(false),
});

export default function ResourcesSection() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  console.log({ resources })
  const form = useForm({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: "",
      file: undefined,
      is_banner: false,
    },
  })


  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const data = await api.get<Resource[]>("resources");
        setResources(data);
      } catch (e) {
        setResources([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);


  const handleSubmit = async (values: z.infer<typeof resourceFormSchema>) => {
    try {
      if (isEditing && selectedResource) {
        // Actualizar recurso existente
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("is_banner", String(values.is_banner));
        if (values.file) formData.append("file", values.file);
        await api.put(`resources/${selectedResource.id}`, formData);
        // Refrescar lista
        const data = await api.get<Resource[]>("resources");
        setResources(data);
      } else {
        // Crear nuevo recurso
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("is_banner", String(values.is_banner));
        if (values.file) formData.append("file", values.file);
        await api.postForm("resources", formData);
        // Refrescar lista
        const data = await api.get<Resource[]>("resources");
        setResources(data);
      }
    } catch (e) {
      // TODO: mostrar error
    } finally {
      form.reset({
        name: "",
        file: undefined,
        is_banner: false,
      });
      setIsEditing(false);
      setSelectedResource(null);
    }
  };

  const handleEdit = (resource: Resource) => {
    console.log("Edit resource:", resource);
    setSelectedResource(resource)
    setIsEditing(true)
    form.reset({
      name: resource.name,
      file: undefined,
      is_banner: resource.is_banner || false,
    })
  }


  const handleDelete = async (resourceId: number) => {
    try {
      await api.delete(`resources/${resourceId}`);
      setResources(resources => resources.filter(r => r.id !== resourceId));
    } catch (e) {
      // TODO: mostrar error
    }
  };

  if (isLoading) {
    return <div>Cargando recursos...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Lista de recursos con DataList */}
      <DataList<Resource>
        items={resources}
        keyExtractor={item => String(item.id)}
        renderItem={item => (
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-[var(--color-text)]/70">
              {item.type} {item.is_banner ? "- Banner" : ""}
            </p>
          </div>
        )}
        renderActions={item => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleEdit(item);
              }}
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleDelete(item.id);
              }}
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </div>
        )}
        emptyListComponent={
          <div className="text-center py-4 text-[var(--color-text)]/70">
            No hay recursos disponibles
          </div>
        }
        className="bg-[var(--color-surface)]/70 p-4 rounded-lg"
      />

      {/* Formulario */}
      <div className="bg-[var(--color-surface)]/70 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "Editar Recurso" : "Nuevo Recurso"}
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
                    <Input placeholder="Nombre del recurso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_banner"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none flex items-center">
                    <FormLabel>Es banner</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Vista previa del recurso en una altura fija */}
            <div className="w-full h-[250px] flex items-center justify-center overflow-hidden rounded border border-dashed">
              {isEditing && selectedResource && selectedResource.thumbnail ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1 absolute top-1 left-0 right-0 text-center">
                    Vista previa actual
                  </span>
                  {selectedResource.type === 'IMAGE' ? (
                    <img
                      src={selectedResource.url}
                      alt={selectedResource.name}
                      className="w-full h-full object-contain p-2 pt-6"
                    />
                  ) : (
                    <video
                      src={selectedResource.url}
                      className="w-full h-full object-contain p-2 pt-6"
                      controls
                    />
                  )}
                </div>
              ) : (
                <span className="text-sm text-[var(--color-text)]/50">
                  {isEditing ? "No hay vista previa disponible" : "El recurso se previsualizará aquí"}
                </span>
              )}
            </div>

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploader
                      maxSize={20 * 1024 * 1024} // 20MB
                      field={field}
                      validator={resourceFormSchema.shape.file}
                      allowedTypes="both"
                      placeholderText={{
                        main: "Arrastra y suelta tu recurso aquí",
                        sub: "o haz clic para seleccionar un archivo",
                        formats: "Formatos soportados: JPG, PNG, MP4, WEBM (máx. 20MB)"
                      }}
                    />
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
                    setSelectedResource(null)
                    form.reset()
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit">
                {isEditing ? "Guardar Cambios" : "Crear Recurso"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}