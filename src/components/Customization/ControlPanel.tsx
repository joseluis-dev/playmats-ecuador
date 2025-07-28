import { SelectCustom } from "@/components/SelectCustom"
import { Label } from "@/components/ui/label"
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

const designSchema = z.object({
  type: z.string(),
  size: z.string().optional(),
  img: z.custom<File>((file) => file instanceof File && file.size > 0, {
    message: "Debes subir una imagen",
  }).refine(file => file.type.startsWith("image/"), {
    message: "El archivo debe ser una imagen",
  }).optional(),
  seals: z.array(z.string()).optional(),
  borders: z.array(z.string()).optional()
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
        value: "61 cm",
        color: "bg-blue-500",
      },
      {
        name: "alto",
        value: "22.5 cm",
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
        value: "61 cm",
        color: "bg-blue-500",
      },
      {
        name: "alto",
        value: "35.5 cm",
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
        value: "61 cm",
        color: "bg-blue-500",
      },
      {
        name: "alto",
        value: "71 cm",
        color: "bg-blue-500",
      }
    ]
  },
];

const sealsOptions = [
  {
    name: "Sello 1",
    url: "",
    thumbnail:
      "",
    watermark: "",
    hosting: "cloudinary",
    type: "image",
    isBanner: false,
    categories: [
      {
        name: "Sellos",
        description: "",
        color: "bg-green-500",
      }
    ],
  },
  {
    name: "Sello 2",
    url: "",
    thumbnail:
      "",
    watermark: "",
    hosting: "cloudinary",
    type: "image",
    isBanner: false,
    categories: [
      {
        name: "Sellos",
        description: "",
        color: "bg-green-500",
      }
    ],
  },
]

const bordersOptions = [
  {
    name: "Borde 1",
    url: "",
    thumbnail:
      "",
    watermark: "",
    hosting: "cloudinary",
    type: "image",
    isBanner: false,
    categories: [
      {
        name: "Bordes",
        description: "",
        color: "bg-red-500",
      }
    ],
  },
  {
    name: "Borde 2",
    url: "",
    thumbnail:
      "",
    watermark: "",
    hosting: "cloudinary",
    type: "image",
    isBanner: false,
    categories: [
      {
        name: "Bordes",
        description: "",
        color: "bg-red-500",
      }
    ],
  },
];

export const ControlPanel = () => {
  const { setImgUrl } = useFabricCanvasStore()
  const form = useForm<z.infer<typeof designSchema>>({
    resolver: zodResolver(designSchema),
    defaultValues: {
      type: "",
      size: "",
      img: undefined,
      seals: [],
      borders: []
    },
  })

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
            <FormItem className="flex flex-col w-full gap-3 items-center">
              <FormControl>
                <CarouselSize items={typesOptions}>
                  {(item, index) => (
                    <div
                      className="relative flex-none aspect-video bg-gray-500/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover' }}
                      onClick={() => {
                        field.onChange(item.name)
                        setImgUrl(item.url);
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
            <FormItem className="flex flex-col w-full gap-3 items-center">
              <FormControl>
                <CarouselSize items={sizesOptions}>
                  {(item, index) => (
                    <div
                      className="relative flex-none aspect-video bg-gray-500/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover' }}
                      onClick={() => field.onChange(item.name)}
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
              <Label>Imagen:</Label>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      field.onChange(e.target.files[0]);
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
            <FormItem className="flex flex-col w-full gap-3 items-center">
              <FormControl>
                <CarouselSize items={sealsOptions}>
                  {(item, index) => (
                    <div
                      className="relative flex-none aspect-video bg-gray-500/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover' }}
                      onClick={() => {
                        const currentSeals = field.value || [];
                        if (currentSeals.includes(item.name)) {
                          field.onChange(currentSeals.filter(seal => seal !== item.name));
                        } else {
                          field.onChange([...currentSeals, item.name]);
                        }
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
          name="borders"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full gap-3 items-center">
              <FormControl>
                <CarouselSize items={bordersOptions}>
                  {(item, index) => (
                    <div
                      className="relative flex-none aspect-video bg-gray-500/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover' }}
                      onClick={() => {
                        const currentBorders = field.value || [];
                        if (currentBorders.includes(item.name)) {
                          field.onChange(currentBorders.filter(border => border !== item.name));
                        } else {
                          field.onChange([...currentBorders, item.name]);
                        }}
                      }
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
        <Button type="submit">
          Comprar
        </Button>
      </form>
    </Form>
  )
}