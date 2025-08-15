import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface CarouselSizeProps {
  opts?: any;
  className?: string;
  items?: any[];
  children?: React.ReactNode | ((item: any, index: number) => React.ReactNode);
}

const numberOfItems = {
  1: "",
  2: "sm:basis-1/2",
  3: "sm:basis-1/3",
  4: "sm:basis-1/4",
};

export function CarouselSize({ opts, className, items = [], children }: CarouselSizeProps) {
  return (
    <Carousel
      opts={opts}
      className="w-full"
    >
      {items && items.length > 0 && <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={index} className={`${numberOfItems[2]}`}>
            {typeof children === "function"
              ? children(item, index)
              : children}
          </CarouselItem>
        ))}
      </CarouselContent>}
      {children && items && items.length > 0 && <CarouselPrevious />}
      {children && items && items.length > 0 && <CarouselNext />}
    </Carousel>
  )
}
