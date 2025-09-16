import { useCustomizationTool } from "@/stores/customToolStore";

export const TotalPrice = () => {
  const { total } = useCustomizationTool();
  return (
    <p className="text-[var(--color-primary)]">Total: ${total}</p>
  )
}
