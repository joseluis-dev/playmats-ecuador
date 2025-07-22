import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type React from "react"
import { useState } from "react"

interface AccordionDynamicProps {
  items: [
    {
      [key: string]: any
    }
  ] | any[]
}

export const AccordionDynamic = ({ items = [] }: AccordionDynamicProps) => {

  return (
    <Accordion type="multiple" className="w-full flex flex-col gap-2">
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="flex items-center hover:no-underline hover:bg-[var(--color-surface)] px-4 border border-[var(--color-text)]">{typeof item.trigger === "function" ? item.trigger(item) : item.trigger}</AccordionTrigger>
          <AccordionContent
            className="px-4 py-2"
          >{typeof item.children === 'function' ? item.children(item) : item.children}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
