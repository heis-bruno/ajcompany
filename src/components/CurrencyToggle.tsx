import { Currency } from '@/types';
import { cn } from '@/lib/utils';
import { DollarSign } from 'lucide-react';

interface CurrencyToggleProps {
  value: Currency;
  onChange: (value: Currency) => void;
  className?: string;
}

export function CurrencyToggle({ value, onChange, className }: CurrencyToggleProps) {
  return (
    <div className={cn(
      'inline-flex items-center p-1 bg-muted rounded-lg',
      className
    )}>
      <button
        type="button"
        onClick={() => onChange('USD')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          value === 'USD'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <DollarSign className="w-4 h-4" />
        USD
      </button>
      <button
        type="button"
        onClick={() => onChange('RWF')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          value === 'RWF'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <span className="font-bold text-xs">RF</span>
        RWF
      </button>
    </div>
  );
}
