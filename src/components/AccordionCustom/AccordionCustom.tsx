import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"

interface AccordionCustomProps {
  item: {
      [key: string]: any
    } | any
  trigger?: React.ReactNode | ((item: any) => React.ReactNode)
  children?: React.ReactNode | ((item: any) => React.ReactNode)
  value?: string
}

export const AccordionCustom = ({ item = {}, trigger = null, children = null, value = '' }: AccordionCustomProps) => {
  return (
    <Accordion type="single" collapsible>
        <AccordionItem key={item.id} value={`${value}`}>
          <AccordionTrigger className="flex items-center hover:no-underline hover:bg-[var(--color-surface)] px-4 border border-[var(--color-text)]">{typeof trigger === "function" ? trigger(item) : trigger}</AccordionTrigger>
          <AccordionContent
            className="px-4 py-2"
          >{typeof children === 'function' ? children(item) : children}</AccordionContent>
        </AccordionItem>
    </Accordion>
  )
}
