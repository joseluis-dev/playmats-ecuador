import type { CartItemType } from "@/stores/cartStore";
import { Button } from "./Button";
import type { ResourceProduct } from "@/types";

interface CartItemProps {
  item: CartItemType;
  onRemove: (item: CartItemType) => void;
  onUpdate: (item: CartItemType, quantity: number) => void;
}

export default function CartItem({ item, onRemove, onUpdate }: CartItemProps) {
  console.log(item)
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    onRemove(item);
  };
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    onUpdate(item, item.quantity + 1);
  };
  const handleSubtract = (e: React.MouseEvent) => {
    e.preventDefault();
    if (item.quantity <= 1) {
      onRemove(item);
      return;
    }
    onUpdate(item, item.quantity - 1);
  };

  const banner = item.resourceProducts.find((resource: ResourceProduct) => resource.isBanner)?.resource || item.resourceProducts[0]?.resource;

  return (
      <a href={`/playmats/${item.id}`} className="
        relative flex gap-4 md:max-w-[600px]
        cursor-pointer
        opacity-90
        rounded-md
        w-full
      ">
        <div className="w-full min-h-[180px] sm:min-h-[200px] md:min-h-[220px] aspect-video rounded-md bg-[var(--color-surface)]/20">
          <img
            src={banner?.url}
            alt={item.name}
            width={500}
            height={300}
            className="w-full h-full aspect-video object-cover rounded-md"
            style={{ viewTransitionName: `img-${item.id}` }}
            loading="lazy"
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full select-none flex flex-col gap-1 text-lg z-20 justify-end text-[var(--color-text)]">
          <div className="bg-[var(--color-surface)]/90 p-3 sm:p-4 rounded-md rounded-t-none flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-balance mb-1 sm:mb-2 dark:text-[var(--color-primary)] text-[var(--color-text)]" style={{ viewTransitionName: `title-${item.id}` }}>
                {item.name}
              </h2>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-heading whitespace-nowrap">${item.subtotal}</span>
              </div>
            </div>

            <div className="flex flex-col w-full justify-between">
              <div className="flex flex-col gap-1 sm:gap-2">
                <p className="text-xs sm:text-sm">Precio Unitario: ${item.price}</p>
                <div className="flex items-center gap-2 sm:gap-4">
                  <p className="text-xs sm:text-sm">Cantidad: {item.quantity}</p>
                  <Button
                    className="py-0.5 sm:py-1 px-2 sm:px-4 transition-all duration-300 ease-in-out hover:bg-[var(--color-primary)]/30 rounded-md text-[var(--color-primary)] border-[var(--color-primary)] border font-bold"
                    label="+"
                    onClick={handleAdd}
                  />
                  <Button
                    className="py-0.5 sm:py-1 px-2 sm:px-4 transition-all duration-300 ease-in-out hover:bg-orange-500/30 rounded-md text-orange-500 border-orange-500 border font-bold"
                    label="-"
                    onClick={handleSubtract}
                  />
                </div>
              </div>
              <Button
                onClick={(e) => handleRemove(e)}
                className="
                  p-1 sm:p-2 transition-all duration-300 ease-in-out
                  rounded-md
                  text-red-600
                  hover:bg-red-500/20
                  self-end
                  text-xs sm:text-sm
                "
                label="Eliminar"
              />
            </div>
          </div>
        </div>
      </a>
  );
}
