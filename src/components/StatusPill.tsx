import { Status } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusPillProps {
  status: Status;
  className?: string;
}

export const StatusPill = ({ status, className }: StatusPillProps) => {
  return (
    <span
      className={cn(
        'status-pill',
        {
          'status-pending': status === 'Pending',
          'status-approved': status === 'Approved',
          'status-rejected': status === 'Rejected',
        },
        className
      )}
    >
      {status}
    </span>
  );
};
