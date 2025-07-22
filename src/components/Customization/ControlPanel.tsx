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
  { value: "playmat", label: "Playmat" },
  { value: "mousepad", label: "Mousepad" }
];

export const ControlPanel = () => {
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
            <FormItem className="flex flex-col w-full gap-3">
              <Label>Tipo:</Label>
              <FormControl>
                <SelectCustom
                  placeholder="Selecciona el tipo"
                  items={typesOptions}
                  // value={field.value}
                  onChange={field.onChange}
                />
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
            <FormItem className="flex flex-col w-full gap-3">
              <Label>Tamaño:</Label>
              <FormControl>
                <SelectCustom
                  placeholder="Selecciona el tamaño"
                  items={[
                    { value: "small", label: "Pequeño" },
                    { value: "medium", label: "Mediano" },
                    { value: "large", label: "Grande" }
                  ]}
                  // value={field.value}
                  onChange={field.onChange}
                />
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
            <FormItem className="flex flex-col w-full gap-3">
              <Label>Sellos:</Label>
              <FormControl>
                <SelectCustom
                  placeholder="Selecciona los sellos"
                  items={[
                    { value: "seal1", label: "Sello 1" },
                    { value: "seal2", label: "Sello 2" }
                  ]}
                  // value={field.value}
                  onChange={field.onChange}
                />
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
            <FormItem className="flex flex-col w-full gap-3">
              <Label>Bordes:</Label>
              <FormControl>
                <SelectCustom
                  placeholder="Selecciona los bordes"
                  items={[
                    { value: "border1", label: "Borde 1" },
                    { value: "border2", label: "Borde 2" }
                  ]}
                  // value={field.value}
                  onChange={field.onChange}
                />
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