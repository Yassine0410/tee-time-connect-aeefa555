import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, required, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

interface SelectCardProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  columns?: 2 | 3;
}

export function SelectCards({ options, value, onChange, columns = 2 }: SelectCardProps) {
  return (
    <div className={cn(
      'grid gap-2',
      columns === 2 ? 'grid-cols-2' : 'grid-cols-3'
    )}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            'border-2',
            value === option.value
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-foreground hover:border-primary/50'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
