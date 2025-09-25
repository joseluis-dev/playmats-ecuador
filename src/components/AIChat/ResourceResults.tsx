import type { SealSearchResult, ResourceItem, ResourceSearchResult } from './types';
import { SealCard, ResourceCard } from './ResourceCard';
import { useEffect, useState } from 'react';

interface ResourceResultsProps {
  data: ResourceSearchResult | null;
  source?: string;
  onItemClick: (item: ResourceItem) => void;
  showTotalPrice?: boolean;
  emptyMessage?: string;
}

export function ResourceResults({ 
  data,
  source,
  onItemClick, 
  showTotalPrice = true, 
  emptyMessage = 'No se encontraron resultados para tu búsqueda' 
}: ResourceResultsProps) {
  const [resources, setResources] = useState<ResourceSearchResult | null>(null);
  useEffect(() => {
    if (!data) return;
    let items: ResourceItem[] = [];
    if (source && source in data && Array.isArray((data as any)[source])) {
      items = (data as any)[source];
    } else if ('items' in data && Array.isArray(data.items)) {
      items = data.items;
    }
    const formatedData = {
      found: data.found,
      count: data.count,
      items,
      message: data.message
    }
    setResources(formatedData);
  }, [data]);

  if (!resources || !resources.items || resources.items.length === 0) {
    return (
      <div className="p-3 bg-[var(--color-muted)]/50 border border-[var(--color-border)] rounded-lg mt-3">
        <p className="text-xs text-[var(--color-muted-foreground)]">
          🔍 {resources?.message || emptyMessage}
        </p>
      </div>
    );
  }

  const totalPrice = showTotalPrice 
    ? resources.items.reduce((sum, item) => {
        const priceAttribute = item.attributes?.find(attr => attr.name.includes('price'));
        return sum + parseFloat(priceAttribute?.value || '0');
      }, 0)
    : 0;

  return (
    <div className="mt-4">
      <div className="mb-3 p-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg">
        <p className="text-xs text-[var(--color-primary)] font-medium">
          ✅ {resources.message}
          {showTotalPrice && ` - $${totalPrice.toFixed(2)} total`}
        </p>
      </div>
      
      {/* Single column layout for popup */}
      <div className="grid grid-cols-1 gap-3">
        {resources.items.map((item, index) => (
          <ResourceCard key={item.id || index} item={item} onItemClick={onItemClick} />
        ))}
      </div>
    </div>
  );
}
