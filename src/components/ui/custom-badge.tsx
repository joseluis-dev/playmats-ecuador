import { getDarkModeVariant } from "@/lib/dark_colors"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type ColorType =
  | "gray"
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | `#${string}`
  | string

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color: ColorType
  label: string
  type?: "ghost" | "outline"
  onRemove?: () => void
}

const isHexColor = (color: string) => /^#(?:[0-9a-f]{3}){1,2}$/i.test(color)

export function CustomBadge({ 
  color, 
  label, 
  type = "ghost", 
  onRemove,
  className,
  ...props 
}: BadgeProps) {
  const isHex = isHexColor(color)

  if (type === "ghost") {
    const ghostClasses = isHex 
      ? cn(
          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
          "ring-1 ring-inset",
          className
        )
      : cn(
          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
          "ring-1 ring-inset",
          `bg-${color}-700/10 text-${color}-700 ring-${color}-700/10`,
          `dark:bg-${color}-400/30 dark:text-${color}-400 dark:ring-${color}-400/30`,
          className
        )

    const style = isHex ? {
      backgroundColor: `${color}1A`, // 10% opacity
      color: color,
      borderColor: `${color}1A`,
      "--dark-bg": `${getDarkModeVariant(color)}4D`, // 30% opacity
      "--dark-text": getDarkModeVariant(color),
      "--dark-border": `${getDarkModeVariant(color)}4D`,
    } as React.CSSProperties : undefined

    return (
      <span
        className={ghostClasses}
        style={style}
        data-dark-style={isHex ? {
          backgroundColor: "var(--dark-bg)",
          color: "var(--dark-text)",
          borderColor: "var(--dark-border)",
        } : undefined}
        {...props}
      >
        {label}
        {onRemove && (
          <X
            className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          />
        )}
      </span>
    )
  }

  // Outline type
  const outlineClasses = cn(
    "inline-flex items-center rounded-md px-2 py-1 text-xs text-center font-medium gap-2",
    "ring-1 ring-[var(--color-text)]",
    className
  )

  const dotClasses = isHex 
    ? "size-2 rounded-full bg-[var(--dot-color)] dark:bg-[var(--dot-color-dark)]"
    : cn(
        "size-2 rounded-full",
        `bg-${color}-500 dark:bg-${color}-400`
      )

  const style = isHex ? {
    "--dot-color": color,
    "--dot-color-dark": getDarkModeVariant(color),
  } as React.CSSProperties : undefined

  return (
    <span className={outlineClasses} {...props}>
      <span
        className={dotClasses}
        style={style}
        data-dark-style={isHex ? { backgroundColor: "var(--dot-color-dark)" } : undefined}
      />
      {label}
      {onRemove && (
        <X
          className="h-3 w-3 cursor-pointer hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        />
      )}
    </span>
  )
}
