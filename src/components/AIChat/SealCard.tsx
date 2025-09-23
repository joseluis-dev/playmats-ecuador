import { CustomBadge } from '@/components/ui/custom-badge';
import type { Seal } from './types';

interface SealCardProps {
  seal: Seal;
  sealAction: ({ seal }: { seal: Seal }) => void;
}

export function SealCard({ seal, sealAction }: SealCardProps) {
  return (
    <div className="border border-border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-pointer" onClick={() => sealAction({ seal })} >
      <div className="mb-3 overflow-hidden rounded-lg">
        <img 
          src={seal.thumbnail || seal.url} 
          alt={seal.name}
          className="w-full h-48 object-cover border transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = seal.url;
          }}
        />
      </div>
      
      <div className="text-center space-y-3">
        <h4 className="font-heading font-semibold text-card-foreground text-sm sm:text-base">
          {seal.name}
        </h4>
        
        {seal.attributes && seal.attributes.length > 0 && (
          <div className="flex justify-center flex-wrap gap-2">
            {seal.attributes.map((attr, attrIndex) => (
              <CustomBadge
                key={attrIndex}
                color={attr.color || '#059669'}
                label={`💰 ${attr.name}`}
                type="ghost"
              />
            ))}
          </div>
        )}
        
        {seal.categories?.[0] && (
          <p className="text-xs text-muted-foreground">
            📂 {seal.categories[0].name}
          </p>
        )}
      </div>
    </div>
  );
}