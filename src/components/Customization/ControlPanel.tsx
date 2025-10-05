import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod";
import { AccordionDynamic } from "../AccordionCustom/AccordionDynamic";
import { CarouselSize } from "../Carousel";
import { useCustomizationTool } from "@/stores/customToolStore";
import { useEffect, useRef } from "react";
import { resourcesService } from "@/services/resourcesService";
import type { Product, Resource } from "@/types";
import { toast } from "sonner";
import { useUser } from "@/stores/userStore";
import { dataUrlToFile } from "@/utils/fileUtils";
import { useCart } from "@/hooks/useCart";
import productService from "@/services/productService";
import { categoriesService } from "@/services/categoriesService";
import { Spinner } from "../ui/spinner";
import { navigate } from "astro:transitions/client";

const designSchema = z.object({
  type: z.custom<Resource>().optional(),
  size: z.custom<Resource>().optional(),
  img: z.custom<File>((file) => file instanceof File && file.size > 0, {
    message: "Debes subir una imagen",
  }).refine(file => file.type.startsWith("image/"), {
    message: "El archivo debe ser una imagen",
  }).optional(),
  seals: z.array(z.custom<Resource>()).optional(),
  border: z.custom<Resource>().optional(),
});

export const ControlPanel = () => {
  const { addLayers, setSize, layers, modifyItems, canvasRef, seals, borders, types, sizes, setSeals, setBorders, setTypes, setSizes, setFormRef, total, loading, setLoading } = useCustomizationTool()
  const { user } = useUser();
  const { addToCart } = useCart()
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<z.infer<typeof designSchema>>({
    resolver: zodResolver(designSchema),
    defaultValues: {
      type: undefined,
      size: undefined,
      img: undefined,
      seals: [],
      border: undefined
    },
  })

  const fetchSeals = async () => {
    return await resourcesService.list({ category: 'sellos' })
  }
  const fetchBorders = async () => {
    return await resourcesService.list({ category: 'bordes' })
  }
  const fetchTypes = async () => {
    return await resourcesService.list({ category: 'tipos' })
  }
  const fetchSizes = async ({ type }: { type: string }) => {
    if (!type) return [];
    const allSizes = await resourcesService.list({ category: `tamaños` });
    // Filter sizes that have the category matching the type
    const sizes = allSizes.filter(resource => resource.categories?.some(cat => cat.id.toString() === type.toString()));
    return sizes;
  }

  useEffect(() => {
    if (!layers.background || layers.background.length === 0) {
      form.setValue("img", undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    }
  }, [layers]);
  
  useEffect(() => {
    fetchSeals().then(res => {
      setSeals(res)
      form.setValue('seals', [])
    }).catch(err => console.error(err))
    fetchBorders().then(res => {
      setBorders(res)
      form.setValue('border', res.find(border => border.name?.toLocaleLowerCase().includes('sin borde')))
    }).catch(err => console.error(err))
    fetchTypes().then(res => {
      setTypes(res)
      form.setValue('type', res.find(type => type.name?.toLocaleLowerCase().includes('playmat')))
    }).catch(err => console.error(err))
    fetchSizes({ type: '1' }).then(res => {
      setSizes(res)
      const smallestSize = res.map(size => {
        const ancho = size.attributes?.find((attr: any) => attr.name.includes('ancho'))?.value || "61";
        const alto = size.attributes?.find((attr: any) => attr.name.includes('alto'))?.value || "22.5";
        return {
          ...size,
          area: parseFloat(ancho) * parseFloat(alto)
        }
      }).sort((a, b) => a.area - b.area)[0];
      setSize(
        parseFloat(smallestSize?.attributes?.find((attr: any) => attr.name.includes('ancho'))?.value || "61") * 10,
        parseFloat(smallestSize?.attributes?.find((attr: any) => attr.name.includes('alto'))?.value || "22.5") * 10
      );
      const price = parseFloat(smallestSize?.attributes?.find((attr: any) => attr.name.includes('price'))?.value || "0") || 0;
      modifyItems('size', price)
      form.setValue('size', smallestSize)
    }).catch(err => console.error(err))
    setFormRef(form);
  }, [])

  async function onSubmit(values: z.infer<typeof designSchema>) {
    if (loading) return; // evitar doble submit
    if (!user?.id) {
      toast.warning('Debes iniciar sesión para añadir al carrito');
      return;
    }
    if (!values.type) return toast.warning("Debes seleccionar un tipo de diseño");
    if (!values.img) return toast.warning("Debes subir una imagen");
    if (!canvasRef) return toast.error("El lienzo no está listo. Por favor, intenta de nuevo.");
    setLoading(true);
    const dataUrl = canvasRef.toDataURL({
      format: 'png',
      multiplier: 4
    });
    const fileDesign = await dataUrlToFile(dataUrl, values.img.name);
    const newProduct = {
      name: `${values.type?.name} - Custom`,
      description: `Diseño personalizado de tipo ${values.type?.name} y tamaño ${values.size?.name || 'personalizado'} - ${user?.id || 'invitado'}`,
      price: total,
      isCustomizable: true
    }

    const formDataDesign = new FormData();
    formDataDesign.append('file', fileDesign);
    formDataDesign.append('type', 'IMAGE')
    formDataDesign.append('isBanner', 'true');

    const formDataBackground = new FormData();
    formDataBackground.append('file', values.img);
    formDataBackground.append('type', 'IMAGE')
    formDataBackground.append('isBanner', 'false');

    const sealsIds = values.seals?.map(seal => seal.id) || [];
    const borderId = values.border?.id;

    try {
      const response = await productService.create(newProduct)
      const createdProduct = response as Product
      const productId = createdProduct.id
      // toast.success('Producto creado correctamente')
      const resourceResponse = await productService.uploadResource(productId, formDataDesign)
      const resource = resourceResponse as unknown as { isBanner: boolean, resource: Resource }
      const resourceId = resource.resource.id

      // Assign categories and attributes
      const categories = [values.type?.categories?.find(cat => cat.name === values.type?.name)?.id.toString()].filter(id => id !== undefined);
      const attributes = [values.size?.attributes?.find(attr => attr.name.includes('ancho'))?.id.toString(), values.size?.attributes?.find(attr => attr.name.includes('alto'))?.id.toString()].filter(id => id !== undefined);

      const resourceBackgroundResponse = await productService.uploadResource(productId, formDataBackground)
      const resourceBackground = resourceBackgroundResponse as unknown as { isBanner: boolean, resource: Resource }
      const resourceBackgroundId = resourceBackground.resource.id

      await productService.assignCategories(productId, {
        categoryIds: categories
      })

      await productService.replaceAttributes(productId, {
        attributeIds: attributes
      })

      await productService.replaceResources(productId, {
        resourcesProduct: [...sealsIds, resourceId, resourceBackgroundId, borderId]
          .filter(id => id !== undefined)
          .map(id => ({ resourceId: String(id), isBanner: id === resourceId  }))
      })

      const productsCategory = await categoriesService.list({ name: 'productos' })
      await resourcesService.assignCategories(resourceId, [...categories, productsCategory[0]?.id.toString()].filter(id => id !== undefined) as string[])
      await resourcesService.assignAttributes(resourceId, attributes)
      await resourcesService.assignCategories(resourceBackgroundId, [...categories, productsCategory[0]?.id.toString()].filter(id => id !== undefined) as string[])

      toast.success('Producto personalizado guardado correctamente')

      await addToCart({ id: createdProduct.id, product: createdProduct, quantity: 1, price: createdProduct.price as number })
      navigate('/payment')
    } catch (error) {
      console.error('Error al guardar el producto:', error)
      toast.error('Error al guardar el producto')
    } finally {
      form.reset({
        type: undefined,
        size: undefined,
        img: undefined,
        seals: [],
        border: undefined
      });
      setLoading(false);
    }
  }

  const accordionItems = [
    {
      trigger: "Tipo de diseño",
      children: () => (
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="flex flex-col w-[85%] gap-3 items-center justify-center mx-auto">
              <FormControl>
                <CarouselSize items={types}>
                  {(item, index) => (
                    <div
                      className="relative flex-none aspect-video bg-gray-500/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      onClick={() => {
                        field.onChange(item)
                        const type = item.categories.find((cat: any) => cat.name === item.name);
                        fetchSizes({ type: type?.id }).then(res => {
                          setSizes(res)
                          const smallestSize = res.map(size => {
                            const ancho = size.attributes?.find((attr: any) => attr.name.includes('ancho'))?.value || "61";
                            const alto = size.attributes?.find((attr: any) => attr.name.includes('alto'))?.value || "22.5";
                            return {
                              ...size,
                              area: parseFloat(ancho) * parseFloat(alto)
                            }
                          }).sort((a, b) => a.area - b.area)[0];
                          setSize(
                            parseFloat(smallestSize?.attributes?.find((attr: any) => attr.name.includes('ancho'))?.value || "61") * 10,
                            parseFloat(smallestSize?.attributes?.find((attr: any) => attr.name.includes('alto'))?.value || "22.5") * 10
                          )
                          const price = parseFloat(smallestSize?.attributes?.find((attr: any) => attr.name.includes('price'))?.value || "0") || 0;
                          modifyItems('size', price)
                          form.setValue('size', smallestSize)
                        }).catch(err => console.error(err))
                        // addLayers('background', item);
                      }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                        {item.name}
                      </div>
                    </div>
                  )}
                </CarouselSize>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    },
    {
      trigger: "Tamaño",
      children: () => (
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem className="flex flex-col w-[85%] gap-3 items-center justify-center mx-auto">
              <FormControl>
                <CarouselSize items={sizes}>
                  {(item, index) => (
                    <div
                      className="relative flex-none aspect-video bg-gray-500/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      onClick={() => {
                        field.onChange(item)
                        const ancho = item.attributes?.find((attr: any) => attr.name.includes('ancho'))?.value || 61;
                        const alto = item.attributes?.find((attr: any) => attr.name.includes('alto'))?.value || 22.5;
                        const price = parseFloat(item.attributes?.find((attr: any) => attr.name.includes('price'))?.value) || 0;
                        setSize(
                          parseFloat(ancho) * 10 || 610,
                          parseFloat(alto) * 10 || 355
                        )
                        modifyItems('size', price);
                      }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                        {item.name}
                      </div>
                    </div>
                  )}
                </CarouselSize>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    },
    {
      trigger: "Subir imagen",
      children: () => (
        <FormField
          control={form.control}
          name="img"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full gap-3">
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      field.onChange(e.target.files[0]);
                      const file = e.target.files[0];
                      if (!file || !file.type.startsWith("image/")) {
                        console.error("El archivo debe ser una imagen");
                        return;
                      }
                      const objectUrl = URL.createObjectURL(file);
                      addLayers('background', {
                        url: objectUrl,
                        name: file.name,
                        type: 'image',
                      });
                      // URL.revokeObjectURL(objectUrl);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    },
    {
      trigger: "Sellos",
      children: () => (
        <FormField
          control={form.control}
          name="seals"
          render={({ field }) => (
            <FormItem className="flex flex-col w-[85%] gap-3 items-center justify-center mx-auto">
              <FormControl>
                <CarouselSize items={seals}>
                  {(item, index) => (
                    <div
                      className="relative flex-none aspect-video bg-[--color-surface] dark:bg-gray-200/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
                      onClick={() => {
                        const currentSeals = field.value || [];
                        field.onChange([...currentSeals, item]);
                        addLayers('seals', item);
                      }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                        {item.name}
                      </div>
                    </div>
                  )}
                </CarouselSize>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    },
    {
      trigger: "Bordes",
      children: () => (
        <FormField
          control={form.control}
          name="border"
          render={({ field }) => (
            <FormItem className="flex flex-col w-[85%] gap-3 items-center justify-center mx-auto">
              <FormControl>
                <CarouselSize items={borders}>
                  {(item, index) => (
                    <div
                      className="relative flex-none aspect-video bg-gray-500/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      onClick={() => {
                        field.onChange(item);
                        // addLayers('borders', item);
                        modifyItems('border', parseFloat(item.attributes?.find((attr: any) => attr.name.includes('price'))?.value) || 0);
                      }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                        {item.name}
                      </div>
                    </div>
                  )}
                </CarouselSize>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    }
  ];

  return (
    <Form {...form}>
      {loading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-40 grid place-items-center">
          <Spinner className='text-[var(--color-primary)] size-14'/>
        </div>
      )}
      <div className="flex justify-center w-full 2xl:max-w-[650px]">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1/2 flex-col gap-3 w-full max-w-[600px]">
          <AccordionDynamic items={accordionItems} />
          <Button type="submit" className="text-[var(--color-text)] disabled:opacity-70 disabled:cursor-not-allowed" variant="default" disabled={loading}>
            {`Añadir al carrito - $${total.toFixed(2)}`}
          </Button>
        </form>
      </div>
    </Form>
  )
}