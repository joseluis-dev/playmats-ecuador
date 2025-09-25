import { CustomBadge } from '@/components/ui/custom-badge';
import type { Seal, ResourceItem } from './types';

interface ResourceCardProps {
  item: ResourceItem;
  onItemClick: (item: ResourceItem) => void;
}

export function ResourceCard({ item, onItemClick }: ResourceCardProps) {
  return (
    <div 
      className="border border-border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-pointer" 
      onClick={() => onItemClick(item)}
    >
      <div className="mb-3 overflow-hidden rounded-lg">
        <img 
          src={item.thumbnail || item.url} 
          alt={item.name}
          className="w-full h-48 object-cover border transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = item.url;
          }}
        />
      </div>
      
      <div className="text-center space-y-3">
        <h4 className="font-heading font-semibold text-card-foreground text-sm sm:text-base">
          {item.name}
        </h4>
        
        {item.attributes && item.attributes.length > 0 && (
          <div className="flex justify-center flex-wrap gap-2">
            {item.attributes.map((attr, attrIndex) => (
              <CustomBadge
                key={attrIndex}
                color={attr.color || '#059669'}
                label={`💰 ${attr.name}`}
                type="ghost"
              />
            ))}
          </div>
        )}
        
        {item.categories?.[0] && (
          <p className="text-xs text-muted-foreground">
            📂 {item.categories[0].name}
          </p>
        )}
      </div>
    </div>
  );
}

// Mantener SealCard como wrapper para compatibilidad hacia atrás
interface SealCardProps {
  seal: Seal;
  sealAction: ({ seal }: { seal: Seal }) => void;
}

export function SealCard({ seal, sealAction }: SealCardProps) {
  return (
    <ResourceCard 
      item={seal} 
      onItemClick={(item) => sealAction({ seal: item as Seal })} 
    />
  );
}