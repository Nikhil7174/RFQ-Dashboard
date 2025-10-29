import { useState, useCallback, memo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { XCircle } from 'lucide-react';

interface RejectDialogProps {
  onReject: (reason?: string) => void;
  trigger?: React.ReactNode;
}

const RejectDialogComponent = ({ onReject, trigger }: RejectDialogProps) => {
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);

  
  const handleReject = useCallback(() => {
    onReject(reason.trim() || undefined);
    setReason('');
    setOpen(false);
  }, [onReject, reason]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" id="reject-trigger-button">
            <XCircle className="mr-1 h-4 w-4" />
            Reject Quotation
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Quotation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reject this quotation? You can optionally provide a reason below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="rejection-reason" className="text-sm font-medium">
            Reason (Optional)
          </Label>
          <Textarea
            id="rejection-reason"
            placeholder="Enter reason for rejection..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2 min-h-[100px]"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason('')}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReject}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Reject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const RejectDialog = memo(RejectDialogComponent);

