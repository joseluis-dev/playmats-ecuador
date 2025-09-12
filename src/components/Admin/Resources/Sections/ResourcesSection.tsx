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
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImageUploader } from "@/components/ImageUploader"
import { DataList } from "@/components/DataList"
import { api } from "@/services/api"
import { resourcesService } from "@/services/resourcesService"
import { categoriesService } from "@/services/categoriesService"
import type { Resource, Category, Attribute } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MultiSelect } from "@/components/ui/multi-select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
  categories: z.array(z.string()).default([]),
  attributes: z.array(z.string()).default([])
});

export default function ResourcesSection() {
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const form = useForm({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: "",
      file: undefined,
      categories: [],
      attributes: []
    },
  })


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch resources, categories, and attributes in parallel
        const [resourcesData, categoriesData, attributesData] = await Promise.all([
          resourcesService.list(),
          categoriesService.list(),
          api.get<Attribute[]>("attributes")
        ]);
        
        setResources(resourcesData);
        setCategories(categoriesData);
        setAttributes(attributesData);
      } catch (e) {
        console.error("Error fetching data:", e);
        setResources([]);
        setCategories([]);
        setAttributes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resourcesData, categoriesData, attributesData] = await Promise.all([
        resourcesService.list(),
        categoriesService.list(),
        api.get<Attribute[]>("attributes")
      ]);
      
      setResources(resourcesData);
      setCategories(categoriesData);
      setAttributes(attributesData);
    } catch (e) {
      console.error("Error fetching data:", e);
      setResources([]);
      setCategories([]);
      setAttributes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof resourceFormSchema>) => {
    console.log(values);
    try {
      let resourceId;
      
      if (isEditing && selectedResource) {
        const updated = await resourcesService.update(selectedResource.id, { name: values.name, file: values.file })
        resourceId = updated.id
      } else {
        const created = await resourcesService.create({ name: values.name, file: values.file })
        resourceId = (created as any).id
      }
      
      // Actualizar las categorías y atributos del recurso
      if (resourceId) {
        // Actualizar categorías si hay seleccionadas
        await resourcesService.assignCategories(resourceId, values.categories)
        await resourcesService.assignAttributes(resourceId, values.attributes)
      }
      
      // Refrescar lista
      loadData();
    } catch (e) {
      console.error("Error al guardar el recurso:", e);
      // TODO: mostrar error
    } finally {
      form.reset({
        name: "",
        file: undefined,
        categories: [],
        attributes: []
      });
      setIsEditing(false);
      setSelectedResource(null);
    }
  };

  const handleEdit = async (resource: Resource) => {
    setSelectedResource(resource);
    setIsEditing(true);
    
    try {
      // Fetch resource with categories and attributes
      const resourceWithRelations = await resourcesService.get(resource.id, ['categories','attributes'])
      
      // Reset form with resource data including relations
      form.reset({
        name: resource.name || "",
        file: undefined,
        categories: resourceWithRelations.categories?.map(c => String(c.id)) || [],
        attributes: resourceWithRelations.attributes?.map(a => String(a.id)) || []
      });
    } catch (e) {
      console.error("Error loading resource details:", e);
      form.reset({
        name: resource.name || "",
        file: undefined,
        categories: [],
        attributes: []
      });
    }
  }


  const handleDelete = async (resourceId: number) => {
    try {
      await api.delete(`resources/${resourceId}`);
      loadData();
      form.reset({
        name: "",
        file: undefined,
        categories: [],
        attributes: []
      });
      setIsEditing(false);
      setSelectedResource(null);
    } catch (e) {
      console.error("Error al eliminar el recurso:", e);
      // TODO: mostrar error
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando recursos...</div>;
  }

  return (
    <>
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold tracking-tight">Recursos</h3>
        <p className="text-sm text-muted-foreground">Administra imágenes y videos; asigna categorías y atributos.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lista</CardTitle>
            <CardDescription>{resources.length} recurso{resources.length === 1 ? '' : 's'}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataList<Resource>
              items={resources}
              selectedId={selectedResource?.id.toString()}
              keyExtractor={item => String(item.id)}
              onSelect={handleEdit}
              renderItem={item => (
                <div className="flex items-center gap-3">
                  {item.type === "IMAGE" ? (
                    <img
                      src={item.thumbnail || item.url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-16 h-16 object-cover rounded-md border"
                      controls={false}
                      muted
                      preload="metadata"
                    />
                  )}
                  <div>
                    <h3 className="font-medium leading-none">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                </div>
              )}
              onDelete={(id) => handleDelete(id as unknown as number)}
              emptyListComponent={<div className="text-center p-6 text-muted-foreground">No hay recursos disponibles</div>}
            />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{isEditing ? "Editar recurso" : "Nuevo recurso"}</CardTitle>
            <CardDescription>Sube una imagen o video y asigna metadatos.</CardDescription>
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
                        <Input placeholder="Nombre del recurso" className='bg-background' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="w-full h-[250px] flex items-center justify-center overflow-hidden rounded-md border border-dashed">
                  {isEditing && selectedResource && selectedResource.thumbnail ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1 absolute top-1 left-0 right-0 text-center">Vista previa</span>
                      {selectedResource.type === 'IMAGE' ? (
                        <img src={selectedResource.url} alt={selectedResource.name} className="w-full h-full object-contain p-2 pt-6" />
                      ) : (
                        <video src={selectedResource.url} className="w-full h-full object-contain p-2 pt-6" controls />
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">{isEditing ? "No hay vista previa disponible" : "El recurso se previsualizará aquí"}</span>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUploader
                          maxSize={20 * 1024 * 1024}
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

                <div className="mt-6">
                  <Tabs defaultValue="categories" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="categories">Categorías</TabsTrigger>
                      <TabsTrigger value="attributes">Atributos</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="categories" className="space-y-4 mt-4">
                      <FormField
                        control={form.control}
                        name="categories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categorías</FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={categories.map(c => ({ id: c.id, name: c.name || '', color: c.color }))}
                                selected={field.value || []}
                                onChange={field.onChange}
                                placeholder="Seleccionar categorías..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="attributes" className="space-y-4 mt-4">
                      <FormField
                        control={form.control}
                        name="attributes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Atributos</FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={attributes.map(a => ({ id: a.id, name: a.name || '', color: a.color }))}
                                selected={field.value || []}
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
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setSelectedResource(null)
                        form.reset({ name: "", file: undefined, categories: [], attributes: [] })
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button type="submit" className='text-[var(--color-text)]'>{isEditing ? "Guardar Cambios" : "Crear Recurso"}</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}