import { Checkbox } from "@/components/ui/checkbox"
import { AccordionCustom } from "@/components/AccordionCustom/AccordionCustom"
import { useEffect, useState } from "react"
import { ShippingAddressForm, type FormValues } from "./ShippingAddressForm"
import { addressService } from "@/services/addressService"
import { useAddress } from "@/hooks/useAddress"

export const AccordionWrapper = () => {
  const { addresses, selected, loading, loadAddresses, addAddress, setCurrent } = useAddress();
  const [countries, setCountries] = useState<{ id: number; nombre: string }[]>([])
  const [states, setStates] = useState<{ id: number; nombre: string }[]>([])

  useEffect(() => {
    loadAddresses();
    (async () => {
      try {
        const [fetchedCountries, fetchedStates] = await Promise.all([
          addressService.getCountries(),
          addressService.getStates().catch(() => [] as any)
        ])
        setCountries(fetchedCountries as any)
        setStates(fetchedStates as any)
      } catch (error) {
        console.error(error)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelect = async (e: React.MouseEvent<HTMLElement, MouseEvent>, item: any) => {
    e.preventDefault();
    setCurrent(item.id);
  }

  const handleSaveAddress = async (address: FormValues) => {
    await addAddress(address)
  };

  return (
    <AccordionCustom
      item={selected || addresses[0] || null}
      value={`shipping-address`}
      classNames={{
        trigger: `hover:bg-[var(--color-surface)] px-4 border border-[var(--color-text)]`,
        content: `px-4 py-2`,
      }}
      trigger={
        (item) => item ? (
          <div className="flex flex-col gap-2">
            <span className="font-heading">Entrega a: {item?.fullname}</span>
            <p className="font-paragraph text-pretty">{item?.addressOne} y {item?.addressTwo}, {item?.city}, {item?.state?.nombre}, {item?.postalCode}, {item?.country?.nombre}</p>
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
      {addresses && addresses.length > 0 && addresses.map((item, index) => (
          <section key={item.id} className="flex items-center gap-4 py-5 cursor-pointer group" onClick={(e) => handleSelect(e, item)}>
            <Checkbox id={`check-${index}`} checked={item.id === (selected?.id || addresses[0]?.id)} className="group-hover:border-blue-500"/>
            <article>
              <h3 className="font-heading font-bold">{item.fullname}</h3>
              <p className="text-pretty">{item.addressOne} y {item.addressTwo}, {item.city}, {item.state?.nombre}, {item.postalCode}, {item.country?.nombre}</p>
              <p className="text-pretty">{item.phone}</p>
            </article>
          </section>
        ))}
        {addresses && addresses.length > 0 && (
          <AccordionCustom
            value="shipping-address-form"
            item={null}
            trigger={'Agregar nueva dirección de envío'}
            classNames={{
              trigger: 'font-heading'
            }}
          >
            <ShippingAddressForm
              onSave={handleSaveAddress}
              countries={countries as any}
              states={states as any}
            />
          </AccordionCustom>
        )}
        {addresses && addresses.length === 0 && (
          <ShippingAddressForm
            onSave={handleSaveAddress}
            countries={countries as any}
            states={states as any}
          />
        )}
    </AccordionCustom>
  )
}
