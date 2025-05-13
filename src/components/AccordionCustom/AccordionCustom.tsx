import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"

interface AccordionCustomProps {
  item: {
      [key: string]: any
    } | any
  trigger?: React.ReactNode | ((item: any) => React.ReactNode)
  children?: React.ReactNode | ((item: any) => React.ReactNode)
  value?: string
  classNames?: {
    trigger?: string
    content?: string
  }
}

export const AccordionCustom = ({ item = {}, trigger = null, children = null, value = '', classNames = { trigger: '', content: '' } }: AccordionCustomProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
        <AccordionItem key={item?.id || '1'} value={`${value}`}>
          <AccordionTrigger className={`flex items-center hover:no-underline ${classNames.trigger}`}>{typeof trigger === "function" ? trigger(item) : trigger}</AccordionTrigger>
          <AccordionContent
            className={`px-4 py-2 ${classNames.content}`}
          >
            {typeof children === 'function' ? children(item) : children}
          </AccordionContent>
        </AccordionItem>
    </Accordion>
  )
}
