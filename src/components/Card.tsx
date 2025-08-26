import React from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
  imageSlot?: ReactNode;
  contentSlot?: ReactNode;
  footerSlot?: ReactNode;
}

/**
 * Card component for displaying content with an optional image, title, subtitle, and price.
 * 
 * @param {CardProps} props - The properties for the Card component.
 * @returns The rendered Card component.
 */
export function Card({
  className,
  id,
  title,
  subtitle,
  price,
  imageSlot,
  contentSlot,
  footerSlot
}: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl",
        "backdrop-blur-md",
        "border border-black/20 dark:border-white/20",
        "shadow-inner shadow-white/10",
        "group",
        "overflow-hidden h-full",
        className
      )}
    >
      {imageSlot}
      
      <div className="select-none flex flex-col gap-1 text-lg z-20 h-full justify-end">
        <div className="bg-[var(--color-surface)]/90 p-4 rounded-md rounded-t-none flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h2 
              data-transition-key={`title-${id}`}
              className="text-xl font-semibold text-balance mb-2 dark:text-[var(--color-primary)] text-[var(--color-text)]"
            >
              {title}
            </h2>
            {price && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[var(--color-primary)]">
                  Desde:
                </span>
                <span className="text-xl font-heading">
                  ${price}
                </span>
              </div>
            )}
          </div>
          
          {subtitle && (
            <p className="text-lg font-semibold text-[var(--color-primary)] dark:text-[var(--color-text)]">
              {subtitle}
            </p>
          )}

          {contentSlot}
          {footerSlot}
        </div>
      </div>
    </div>
  );
}

export default Card;
