import { useState } from 'react'
import { ResourcesManager } from '@/components/Admin/ResourcesManager'
import { CategoriesManager } from '@/components/Admin/CategoriesManager'
import { AttributesManager } from '@/components/Admin/AttributesManager'
import { ProductsManager } from './Products/ProductsManager'

const sections = [
  { id: 'products', name: 'Productos' },
  { id: 'resources', name: 'Recursos' },
  { id: 'categories', name: 'Categorías' },
  { id: 'attributes', name: 'Atributos' }
]

export const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('products')

  const renderSection = () => {
    switch (activeSection) {
      case 'products':
        return <ProductsManager />
      case 'resources':
        return <ResourcesManager />
      case 'categories':
        return <CategoriesManager />
      case 'attributes':
        return <AttributesManager />
      default:
        return <ProductsManager />
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>
      
      <nav className="flex gap-4 border-b border-[var(--color-text)]/20">
        {sections.map(section => (
          <button
            key={section.id}
            className={`px-4 py-2 ${
              activeSection === section.id
                ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'text-[var(--color-text)]/70 hover:text-[var(--color-text)]'
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.name}
          </button>
        ))}
      </nav>

      <section className="min-h-[500px]">
        {renderSection()}
      </section>
    </div>
  )
}
