import { useFabricCanvasStore } from "@/stores/fabricCanvasStore";

export const TotalPrice = () => {
  const { total } = useFabricCanvasStore();
  return (
    <p className="text-[var(--color-primary)]">Total: ${total}</p>
  )
}
