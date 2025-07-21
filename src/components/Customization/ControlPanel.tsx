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

const designSchema = z.object({
  type: z.string().uuid(),
  size: z.string().optional(),
  img: z.custom<File>((file) => file instanceof File && file.size > 0, {
    message: "Debes subir una imagen",
  }).refine(file => file.type.startsWith("image/"), {
    message: "El archivo debe ser una imagen",
  }).optional(),
  seals: z.array(z.string()).optional(),
  borders: z.array(z.string()).optional()
});

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

  const handleChange = {
    type: (value: string) => form.setValue('type', value),
    size: (value: string) => form.setValue('size', value),
    img: (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        form.setValue('img', file);
      }
    },
    seals: (value: string[]) => form.setValue('seals', value),
    borders: (value: string[]) => form.setValue('borders', value),
  }

  function onSubmit(values: z.infer<typeof designSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex justify-end text-2xl p-4 w-full">
          <p className="text-[var(--color-primary)]">Total: $25</p>
        </div>
        <div className="flex w-full gap-3">
          <div className="flex flex-col w-full gap-3">
            <Label htmlFor="imgUrl">Tipo:</Label>
            <SelectCustom placeholder="Selecciona el tipo" items={[{ value: 'playmat', label: 'Playmat' }, { value: 'mousepad', label: 'Mousepad' }
            ]} onChange={handleChange.type} />
          </div>
          <div className="flex flex-col w-full gap-3">
            <Label htmlFor="imgUrl">Tamaño:</Label>
            <SelectCustom placeholder="Selecciona el tamaño" items={[]} onChange={handleChange.size} />
          </div>
        </div>
        <div className="flex flex-col w-full max-w-sm gap-3">
          <Label htmlFor="imgUrl">Sube tu imagen:</Label>
          <Input type="file" id="imgUrl" />
        </div>
        <div className="flex flex-col w-full gap-3">
          <Label htmlFor="imgUrl">Sellos:</Label>
          <SelectCustom placeholder="Selecciona el sellos" items={[]} />
        </div>
        <div className="flex flex-col w-full max-w-sm gap-3">
          <Label htmlFor="imgUrl">Bordes:</Label>
          <SelectCustom placeholder="Selecciona el bordes" items={[]} />
        </div>
        <Button type="submit">
          Comprar
        </Button>
      </form>
    </Form>
  )
}
