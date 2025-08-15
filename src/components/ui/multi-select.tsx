import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { CustomBadge } from "@/components/ui/custom-badge"

interface MultiSelectProps {
  options: { id: string | number; name: string; color?: string }[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  label?: string
}

export function MultiSelect({ 
  options, 
  selected, 
  onChange,
  placeholder = "Buscar...",
  label
}: MultiSelectProps) {
  return (
    <div className="flex flex-col space-y-4">
      {/* Lista con buscador */}
      <Command className="border rounded-md bg-transparent text-[var(--text-color)]">
        <CommandInput placeholder={placeholder} className="h-9" />
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        <CommandGroup className="max-h-[200px] overflow-auto p-1">
          {options.map((option) => {
            const isSelected = selected.includes(String(option.id))
            return (
              <CommandItem
                key={option.id}
                value={option.name}
                onSelect={() => {
                  if (isSelected) {
                    onChange(selected.filter((v) => v !== String(option.id)))
                  } else {
                    onChange([...selected, String(option.id)])
                  }
                }}
                className="flex items-center gap-2 data-[selected=true]:bg-[var(--color-surface)]"
              >
                <div className="flex items-center gap-2 flex-1">
                  <CustomBadge
                    className="text-[var(--color-text)]"
                    label={option.name}
                    color={option.color || "gray"}
                    type="outline"
                  />
                </div>
                <Check className={cn(
                  "h-4 w-4 ml-2 flex-shrink-0",
                  isSelected ? "opacity-100" : "opacity-0"
                )} />
              </CommandItem>
            )
          })}
        </CommandGroup>
      </Command>

      {/* Área de seleccionados */}
      <div className="space-y-2">
        {label && (
          <div className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </div>
        )}
        <div className="min-h-[2.5rem] rounded-md flex flex-wrap gap-1 p-1">
          {selected.length === 0 && (
            <span className="px-2 py-0.5 text-muted-foreground text-sm">
              No hay elementos seleccionados
            </span>
          )}
          {selected.map((id) => {
            const option = options.find((opt) => String(opt.id) === id)
            if (!option) return null
            return (
              <CustomBadge
                key={id}
                label={option.name}
                color={option.color || "gray"}
                type="outline"
                onRemove={() => onChange(selected.filter((v) => v !== id))}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
