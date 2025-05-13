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
  ] | any[],
  trigger?: React.ReactNode | ((item: any) => React.ReactNode)
  children?: React.ReactNode | ((item: any) => React.ReactNode)
}

export const AccordionDynamic = ({ items = [], trigger = null, children = null }: AccordionDynamicProps) => {

  return (
    <Accordion type="multiple">
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="flex items-center hover:no-underline hover:bg-[var(--color-surface)] px-4 border border-[var(--color-text)]">{typeof trigger === "function" ? trigger(item) : trigger}</AccordionTrigger>
          <AccordionContent
            className="px-4 py-2"
          >{typeof children === 'function' ? children(item) : children}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
