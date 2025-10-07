"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorOption {
  color: string
  name: string
}

interface ColorPickerProps {
  colors?: ColorOption[]
  defaultColor?: string
  onColorChange?: (color: ColorOption) => void
  label?: string
}

export function ColorPicker({
  colors = [
    {
      color: "#FFD700",
      name: "gold"
    },
    {
      color: "#E8E8E8",
      name: "silver"
    },
  ],
  defaultColor,
  onColorChange,
  label = "Selecciona un filtro de color",
}: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(defaultColor || colors[0].color)

  const handleColorSelect = (color: ColorOption) => {
    setSelectedColor(color.color)
    onColorChange?.(color)
  }

  const selectedColorOption = colors.find(c => c.color === selectedColor) || colors[0]

  return (
    <div className="w-full space-y-3 mb-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
        <div className="flex items-center gap-3 rounded-lg bg-gray-500/20 shadow-md p-3 transition-all duration-200 ease-in-out">
          <div
            className="h-10 w-10 rounded-lg shadow-sm transition-transform hover:scale-105 ring-1 ring-gray-300"
            style={{ backgroundColor: selectedColor }}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-text)]">Filtro {selectedColorOption.name}</p>
            <p className="text-xs font-mono text-[var(--color-text)]/60">{selectedColor}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {colors.map((colorOption) => (
          <button
            key={colorOption.color}
            type="button"
            onClick={() => handleColorSelect(colorOption)}
            className={cn(
              "group relative h-12 w-full rounded-lg transition-all duration-200 ease-in-out cursor-pointer hover:scale-105 shadow-md ring-1 ring-gray-300",
              selectedColor === colorOption.color
                ? "ring-2 ring-blue-500 shadow-lg"
                : "hover:ring-1 hover:ring-blue-500",
            )}
            style={{ backgroundColor: colorOption.color }}
            aria-label={`Seleccionar color ${colorOption.name}`}
          >
            {selectedColor === colorOption.color && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-white/90 p-1 shadow-md">
                  <Check className="h-3 w-3 text-gray-800" strokeWidth={3} />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
