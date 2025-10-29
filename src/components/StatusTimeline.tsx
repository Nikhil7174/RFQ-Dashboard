import { memo } from 'react';
import { StatusHistoryEntry } from '@/lib/types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatusTimelineProps {
  history: StatusHistoryEntry[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Approved':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'Rejected':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'Pending':
      return <Clock className="h-5 w-5 text-yellow-600" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved':
      return 'border-green-600';
    case 'Rejected':
      return 'border-red-600';
    case 'Pending':
      return 'border-yellow-600';
    default:
      return 'border-gray-600';
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const StatusTimelineComponent = ({ history }: StatusTimelineProps) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Status History</h3>
      <div className="space-y-4">
        {history.map((entry, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`rounded-full border-2 ${getStatusColor(entry.status)} bg-white p-1`}>
                {getStatusIcon(entry.status)}
              </div>
              {index < history.length - 1 && (
                <div className="h-full w-0.5 bg-border my-1" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{entry.status}</span>
                <span className="text-sm text-muted-foreground">by</span>
                <span className="text-sm font-medium">{entry.changedBy}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTimestamp(entry.changedAt)}
              </p>
              {entry.reason && (
                <div className="mt-2 text-sm bg-muted px-3 py-2 rounded-md">
                  <span className="font-medium">Reason: </span>
                  {entry.reason}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const StatusTimeline = memo(StatusTimelineComponent);

