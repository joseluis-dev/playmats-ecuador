import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectCustomProps {
  classNames?: {
    trigger?: string
    content?: string
    group?: string
    item?: string
    label?: string
  }
  placeholder?: string
  items?: { value: string; label: string }[]
  onChange?: (value: string) => void
}

export const SelectCustom = ({ classNames = { trigger: '', content: '', group: '', item: '', label: '' }, placeholder = '', items = [], onChange }: SelectCustomProps) => {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="">
        <SelectGroup className="">
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value} className="">
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
