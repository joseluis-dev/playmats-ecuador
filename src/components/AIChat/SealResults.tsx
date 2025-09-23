import type { SealSearchResult } from './types';
import { SealCard } from './SealCard';

interface SealResultsProps {
  sealData: SealSearchResult | null;
  sealAction: ({ seal }: { seal: any }) => void;
}

export function SealResults({ sealData, sealAction }: SealResultsProps) {
  if (!sealData || !sealData.seals || sealData.seals.length === 0) {
    return (
      <div className="p-3 bg-[var(--color-muted)]/50 border border-[var(--color-border)] rounded-lg mt-3">
        <p className="text-xs text-[var(--color-muted-foreground)]">
          🔍 {sealData?.message || 'No se encontraron sellos para tu búsqueda'}
        </p>
      </div>
    );
  }

  const totalPrice = sealData.seals.reduce((sum, seal) => 
    sum + parseFloat(seal.attributes?.[0]?.value || '0'), 0
  );

  return (
    <div className="mt-4">
      <div className="mb-3 p-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg">
        <p className="text-xs text-[var(--color-primary)] font-medium">
          ✅ {sealData.message} - ${totalPrice.toFixed(2)} total
        </p>
      </div>
      
      {/* Single column layout for popup */}
      <div className="grid grid-cols-1 gap-3">
        {sealData.seals.map((seal, index) => (
          <SealCard key={seal.id || index} seal={seal} sealAction={sealAction} />
        ))}
      </div>
    </div>
  );
}