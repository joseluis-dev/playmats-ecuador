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
import { PencilIcon, Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImageUploader } from "@/components/ImageUploader"
import { DataList } from "@/components/DataList"
import { api } from "@/services/api"
import type { Resource } from "@/types"

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
    ).optional()
});

export default function ResourcesSection() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const form = useForm({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: "",
      file: undefined
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

  const loadData = async () => {
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

  const handleSubmit = async (values: z.infer<typeof resourceFormSchema>) => {
    console.log(values);
    try {
      if (isEditing && selectedResource) {
        // Actualizar recurso existente
        const formData = new FormData();
        formData.append("name", values.name);
        if (values.file) formData.append("file", values.file);
        await api.putForm(`resources/${selectedResource.id}`, formData);
        // Refrescar lista
        loadData();
      } else {
        // Crear nuevo recurso
        const formData = new FormData();
        formData.append("name", values.name);
        if (values.file) formData.append("file", values.file);
        await api.postForm("resources", formData);
        // Refrescar lista
        loadData()
      }
    } catch (e) {
      // TODO: mostrar error
    } finally {
      form.reset({
        name: "",
        file: undefined,
      });
      setIsEditing(false);
      setSelectedResource(null);
    }
  };

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource)
    setIsEditing(true)
    form.reset({
      name: resource.name,
      file: undefined,
    })
  }


  const handleDelete = async (resourceId: number) => {
    try {
      await api.delete(`resources/${resourceId}`);
      loadData();
      form.reset({
        name: "",
        file: undefined,
      });
      setIsEditing(false);
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
              {item.type}
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

            {/* Vista previa del recurso en una altura fija */}
            <div className="w-full h-[250px] flex items-center justify-center overflow-hidden rounded border border-dashed">
              {isEditing && selectedResource && selectedResource.thumbnail ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1 absolute top-1 left-0 right-0 text-center">
                    Vista previa
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
                    form.reset({
                      name: "",
                      file: undefined
                    })
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