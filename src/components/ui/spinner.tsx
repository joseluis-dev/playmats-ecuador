import { cn } from "@/lib/utils"
import LoadingFlowcwIcon from "../icons/LoadingFlowcwIcon"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoadingFlowcwIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
