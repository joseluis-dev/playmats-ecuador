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
  const { addLayers, setSize, layers, modifyItems, canvasRef, seals, borders, types, sizes, setSeals, setBorders, setTypes, setSizes, setFormRef, total } = useCustomizationTool()
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
    return await resourcesService.list({ category: '3' })
  }
  const fetchBorders = async () => {
    return await resourcesService.list({ category: '4' })
  }
  const fetchTypes = async () => {
    return await resourcesService.list({ category: '10' })
  }
  const fetchSizes = async ({ type }: { type: string }) => {
    if (!type) return [];
    return await resourcesService.list({ category: `8,${type}` })
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
    fetchSeals().then(res => setSeals(res)).catch(err => console.error(err))
    fetchBorders().then(res => setBorders(res)).catch(err => console.error(err))
    fetchTypes().then(res => setTypes(res)).catch(err => console.error(err))
    fetchSizes({ type: '1' }).then(res => setSizes(res)).catch(err => console.error(err))
    setFormRef(form);
  }, [])

  useEffect(() => {
    if (!types || types.length === 0) return;
    if (!borders || borders.length === 0) return;
    if (!sizes || sizes.length === 0) return;
    form.reset({
      type: types.find(t => t.name === 'Playmat') || undefined,
      size: (() => {
        if (!sizes || sizes.length === 0) return undefined;
        const sizesWithArea = sizes.map(s => {
          const ancho = s.attributes?.find((attr: any) => attr.name.includes('ancho'))?.value || "61";
          const alto = s.attributes?.find((attr: any) => attr.name.includes('alto'))?.value || "22.5";
          const area = parseFloat(ancho) * parseFloat(alto);
          return { ...s, area };
        });
        const sortedSizes = sizesWithArea.sort((a, b) => (a.area || 0) - (b.area || 0));
        return sortedSizes[0];
      })(),
      img: undefined,
      seals: [],
      border: borders.find(b => b.name === 'Bordes sin borde') || undefined
    });
  }, [types, borders, sizes])

  async function onSubmit(values: z.infer<typeof designSchema>) {
    if (!values.type) return toast.warning("Debes seleccionar un tipo de diseño");
    if (!values.img) return toast.warning("Debes subir una imagen");
    if (!canvasRef) return toast.error("El lienzo no está listo. Por favor, intenta de nuevo.");
    const dataUrl = canvasRef.toDataURL({
      format: 'png',
      multiplier: 4
    });
    const fileDesign = await dataUrlToFile(dataUrl, values.img.name);
    const newProduct = {
      name: `${values.type?.name} - Diseño personalizado`,
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
        resourceIds: [...sealsIds, resourceId, resourceBackgroundId, borderId]
          .filter(id => id !== undefined)
          .map(id => String(id))
      })

      await resourcesService.assignCategories(resourceId, categories)
      await resourcesService.assignAttributes(resourceId, attributes)

      toast.success('Producto personalizado guardado correctamente')

      await addToCart({ id: createdProduct.id, product: createdProduct, quantity: 1, price: createdProduct.price as number })
      window.location.assign('/payment')
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
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover' }}
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
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover' }}
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
                      className="relative flex-none aspect-video bg-gray-500/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover' }}
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
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover' }}
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full">
        <AccordionDynamic items={accordionItems} />
        <Button type="submit" className="text-[var(--color-text)]" variant="default">
          Añadir al carrito - ${total.toFixed(2)}
        </Button>
      </form>
    </Form>
  )
}