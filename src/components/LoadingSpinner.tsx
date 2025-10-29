import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const LoadingSpinnerComponent = ({ className, size = 'md' }: LoadingSpinnerProps) => {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
    </div>
  );
};

export const LoadingSpinner = memo(LoadingSpinnerComponent);
