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
}

export const SelectCustom = ({ classNames = { trigger: '', content: '', group: '', item: '', label: '' }, placeholder = '' }: SelectCustomProps) => {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="">
        <SelectGroup className="">
          <SelectLabel className="">Fruits</SelectLabel>
          <SelectItem value="apple" className="">Apple</SelectItem>
          <SelectItem value="banana" className="">Banana</SelectItem>
          <SelectItem value="blueberry" className="">Blueberry</SelectItem>
          <SelectItem value="grapes" className="">Grapes</SelectItem>
          <SelectItem value="pineapple" className="">Pineapple</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
