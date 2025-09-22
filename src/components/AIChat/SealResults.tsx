import type { SealSearchResult } from './types';
import { SealCard } from './SealCard';

interface SealResultsProps {
  sealData: SealSearchResult | null;
}

export function SealResults({ sealData }: SealResultsProps) {
  if (!sealData || !sealData.seals || sealData.seals.length === 0) {
    return (
      <div className="p-4 bg-muted/50 border border-border rounded-lg mt-4">
        <p className="text-sm text-muted-foreground">
          🔍 {sealData?.message || 'No se encontraron sellos para tu búsqueda'}
        </p>
      </div>
    );
  }

  const totalPrice = sealData.seals.reduce((sum, seal) => 
    sum + parseFloat(seal.attributes?.[0]?.value || '0'), 0
  );

  return (
    <div className="mt-6">
      <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-sm text-primary font-medium">
          ✅ {sealData.message} - ${totalPrice} total
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sealData.seals.map((seal, index) => (
          <SealCard key={seal.id || index} seal={seal} />
        ))}
      </div>
    </div>
  );
}