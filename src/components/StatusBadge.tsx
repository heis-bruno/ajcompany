import { LoanStatus, PaymentStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: LoanStatus | PaymentStatus;
  className?: string;
}

const statusStyles: Record<string, string> = {
  Active: 'bg-accent/10 text-accent border-accent/20',
  Overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  Paid: 'bg-success/10 text-success border-success/20',
  Pending: 'bg-warning/10 text-warning border-warning/20',
  Partial: 'bg-info/10 text-info border-info/20',
  Completed: 'bg-success/10 text-success border-success/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        statusStyles[status] || 'bg-muted text-muted-foreground border-border',
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        status === 'Active' && 'bg-accent',
        status === 'Overdue' && 'bg-destructive',
        status === 'Paid' && 'bg-success',
        status === 'Pending' && 'bg-warning',
        status === 'Partial' && 'bg-info',
        status === 'Completed' && 'bg-success',
      )} />
      {status}
    </span>
  );
}
