import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'accent' | 'success' | 'destructive' | 'warning';
  className?: string;
}

const variantStyles = {
  default: 'bg-card border-border',
  accent: 'bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20',
  success: 'bg-gradient-to-br from-success/10 to-success/5 border-success/20',
  destructive: 'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20',
  warning: 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  accent: 'bg-accent/20 text-accent',
  success: 'bg-success/20 text-success',
  destructive: 'bg-destructive/20 text-destructive',
  warning: 'bg-warning/20 text-warning',
};

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        'p-6 border transition-all duration-300 hover:shadow-lg',
        variantStyles[variant],
        className
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2 text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                'flex items-center mt-2 text-xs font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            )}
          </div>
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            iconStyles[variant]
          )}>
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
