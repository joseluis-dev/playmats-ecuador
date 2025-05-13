import { Checkbox } from "@/components/ui/checkbox"
import { AccordionCustom } from "../AccordionCustom/AccordionCustom"
import { useState } from "react"
import { ShippingAddressForm } from "./ShippingAddressForm"

interface AccordionWrapperProps {
  items: [
    {
      [key: string]: any
    }
  ] | any[]
}

export const AccordionWrapper = ({ items = [] }: AccordionWrapperProps) => {
  const [selected, setSelected] = useState<any | null>(null)

  const handleSelect = (e: React.MouseEvent<HTMLElement, MouseEvent>, item: any) => {
    setSelected(item)
  }

  return (
    <AccordionCustom
      item={selected || items[0] || null}
      value={`shipping-address`}
      classNames={{
        trigger: `hover:bg-[var(--color-surface)] px-4 border border-[var(--color-text)]`,
        content: `px-4 py-2`,
      }}
      trigger={
        (item) => item ? (
          <div className="flex flex-col gap-2">
            <span className="font-heading">Entrega a: {item?.fullname}</span>
            <p className="font-paragraph text-pretty">{item?.address_one} y {item?.address_two}, {item?.city}, {item?.state.name}, {item?.postal_code}, {item?.country.name}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="font-heading">No hay dirección de envío</span>
            <p className="font-paragraph text-pretty">
              Complete su información de envío para continuar con su compra
            </p>
          </div>
        )
      }
    >
      {items.length > 0 && items.map((item, index) => (
          <section key={item.id} className="flex items-center gap-4 py-5 cursor-pointer group" onClick={(e) => handleSelect(e, item)}>
            <Checkbox id={`check-${index}`} checked={item.id === (selected?.id || items[0]?.id)} className="group-hover:border-blue-500"/>
            <article>
              <h3 className="font-heading font-bold">{item.fullname}</h3>
              <p className="text-pretty">{item.address_one} y {item.address_two}, {item.city}, {item.state.name}, {item.postal_code}, {item.country.name}</p>
              <p className="text-pretty">{item.phone}</p>
            </article>
          </section>
        ))}
        {items.length > 0 && (
          <AccordionCustom
            value="shipping-address-form"
            item={null}
            trigger={'Agregar nueva dirección de envío'}
            classNames={{
              trigger: 'font-heading'
            }}
          >
            <ShippingAddressForm />
          </AccordionCustom>
        )}
        {items.length === 0 && (
          <ShippingAddressForm />
        )}
    </AccordionCustom>
  )
}
