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
import { useFabricCanvasStore } from "@/stores/fabricCanvasStore";
import { useEffect, useRef, useState } from "react";
import { resourcesService } from "@/services/resourcesService";
import type { Resource } from "@/types";

const designSchema = z.object({
  type: z.string(),
  size: z.string().optional(),
  img: z.custom<File>((file) => file instanceof File && file.size > 0, {
    message: "Debes subir una imagen",
  }).refine(file => file.type.startsWith("image/"), {
    message: "El archivo debe ser una imagen",
  }).optional(),
  seals: z.array(z.custom<Resource>()).optional(),
  border: z.custom<Resource>().optional(),
});

const typesOptions = [
  {
    name: "Playmat",
    url: "https://res.cloudinary.com/dcxt2wrcm/image/upload/v1745801198/Playmat-Vitral-de-Tierras_uklbn7.webp",
    thumbnail:
      "https://res.cloudinary.com/dcxt2wrcm/image/upload/v1745801198/Playmat-Vitral-de-Tierras_uklbn7.webp",
    watermark: "",
    hosting: "cloudinary",
    type: "image",
    isBanner: false,
    categories: [
      {
        name: "Tipo de diseño",
        description: "",
        color: "bg-purple-500",
      }
    ],
  },
  {
    name: "Mousepad",
    url: "https://res.cloudinary.com/dcxt2wrcm/image/upload/v1745801197/Mouspad-Gamer_yau6cl.webp",
    thumbnail:
      "https://res.cloudinary.com/dcxt2wrcm/image/upload/v1745801197/Mouspad-Gamer_yau6cl.webp",
    watermark: "",
    hosting: "cloudinary",
    type: "image",
    isBanner: false,
    categories: [
      {
        name: "Tipo de diseño",
        description: "",
        color: "bg-purple-500",
      }
    ],
  },
];

const sizesOptions = [
  {
    name: "Mediano",
    url: "",
    thumbnail:
      "",
    watermark: "",
    hosting: "cloudinary",
    type: "image",
    isBanner: false,
    attribute: [
      {
        name: "ancho",
        value: 61,
        color: "bg-blue-500",
      },
      {
        name: "alto",
        value: 22.5,
        color: "bg-blue-500",
      },
      {
        name: "price",
        value: 20,
        color: "bg-blue-500",
      }
    ]
  },
  {
    name: "Grande",
    url: "",
    thumbnail:
      "",
    watermark: "",
    hosting: "cloudinary",
    type: "image",
    isBanner: false,
    attribute: [
      {
        name: "ancho",
        value: 61,
        color: "bg-blue-500",
      },
      {
        name: "alto",
        value: 35.5,
        color: "bg-blue-500",
      },
      {
        name: "price",
        value: 30,
        color: "bg-blue-500",
      }
    ]
  },
  {
    name: "Doble",
    url: "",
    thumbnail:
      "",
    watermark: "",
    hosting: "cloudinary",
    type: "image",
    isBanner: false,
    attribute: [
      {
        name: "ancho",
        value: 61,
        color: "bg-blue-500",
      },
      {
        name: "alto",
        value: 71,
        color: "bg-blue-500",
      },
      {
        name: "price",
        value: 50,
        color: "bg-blue-500",
      }
    ]
  },
];

export const ControlPanel = () => {
  const { addLayers, setSize, layers, modifyItems } = useFabricCanvasStore()
  const [seals, setSeals] = useState<Resource[]>([])
  const [borders, setBorders] = useState<Resource[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<z.infer<typeof designSchema>>({
    resolver: zodResolver(designSchema),
    defaultValues: {
      type: "",
      size: "",
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
  }, [])

  function onSubmit(values: z.infer<typeof designSchema>) {
    console.log(values)
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
                <CarouselSize items={typesOptions}>
                  {(item, index) => (
                    <div
                      className="relative flex-none aspect-video bg-gray-500/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover' }}
                      onClick={() => {
                        field.onChange(item.name)
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
                <CarouselSize items={sizesOptions}>
                  {(item, index) => (
                    <div
                      className="relative flex-none aspect-video bg-gray-500/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover' }}
                      onClick={() => {
                        field.onChange(item.name)
                        setSize(
                          parseFloat(item.attribute?.find((attr: any) => attr.name === 'ancho')?.value) * 10 || 610,
                          parseFloat(item.attribute?.find((attr: any) => attr.name === 'alto')?.value) * 10 || 355
                        )
                        modifyItems('size', item.attribute?.find((attr: any) => attr.name.includes('price'))?.value || 0);
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
                        if (currentSeals.includes(item.name)) {
                          field.onChange(currentSeals.filter(seal => seal.name !== item.name));
                        } else {
                          field.onChange([...currentSeals, item]);
                        }
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
                        const currentBorder = field.value || undefined;
                        if (currentBorder?.name === item.name) {
                          field.onChange(undefined);
                        } else {
                          field.onChange(item);
                        }
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
          Comprar
        </Button>
      </form>
    </Form>
  )
}