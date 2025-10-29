import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuotationDetail } from '@/features/quotations/hooks/useQuotationDetail';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusPill } from '@/components/StatusPill';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { RejectDialog } from '@/components/RejectDialog';
import { StatusTimeline } from '@/components/StatusTimeline';
import { getAvailableActions } from '@/lib/permissions';
import { ArrowLeft, Edit2, Save, X, MessageSquare, CheckCircle } from 'lucide-react';
import { CommentsSection } from '@/features/quotations/components/CommentsSection';
import { useAppDispatch } from '@/store/hooks';
import { updateQuotationStatus, optimisticStatusUpdate, rollbackStatusUpdate } from '@/store/slices/quotationsSlice';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  if (!id) {
    navigate('/');
    return null;
  }

  const { quotation, loading, error, commentsLoading, user, handleUpdateDetails, handleAddComment, handleAddReply } = useQuotationDetail(id);

  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [nextLocation, setNextLocation] = useState<string | null>(null);
  const [editedData, setEditedData] = useState({
    client: '',
    amount: 0,
    description: '',
  });

  // Warn before leaving page with unsaved changes (browser navigation)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Custom navigation handler with confirmation
  const handleNavigateWithConfirmation = useCallback((path: string) => {
    if (isDirty) {
      setNextLocation(path);
      setShowUnsavedDialog(true);
    } else {
      navigate(path);
    }
  }, [isDirty, navigate]);

  // Intercept back button navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isDirty) {
        e.preventDefault();
        const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave this page?');
        if (!confirmLeave) {
          // Push the current state back
          window.history.pushState(null, '', location.pathname);
        }
      }
    };

    if (isDirty) {
      window.history.pushState(null, '', location.pathname);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty, location.pathname]);

  const handleEdit = () => {
    if (quotation) {
      setEditedData({
        client: quotation.client,
        amount: quotation.amount,
        description: quotation.description || '',
      });
      setIsEditing(true);
      setIsDirty(false);
    }
  };

  const handleSave = async () => {
    await handleUpdateDetails(editedData);
    setIsEditing(false);
    setIsDirty(false);
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (!confirmed) return;
    }
    setIsEditing(false);
    setIsDirty(false);
  };

  const handleFieldChange = (field: keyof typeof editedData, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleApprove = async () => {
    if (!quotation || !user) return;

    const previousStatus = quotation.status;
    dispatch(optimisticStatusUpdate({ id, status: 'Approved' }));
    toast.loading('Approving quotation...');

    try {
      await dispatch(updateQuotationStatus({ 
        id, 
        status: 'Approved',
        userInfo: { name: user.name, role: user.role }
      })).unwrap();
      toast.dismiss();
      toast.success('Quotation approved successfully');
    } catch (error: any) {
      dispatch(rollbackStatusUpdate({ id, previousStatus }));
      toast.dismiss();
      toast.error(error?.message || 'Failed to approve quotation');
    }
  };

  const handleReject = async (reason?: string) => {
    if (!quotation || !user) return;

    const previousStatus = quotation.status;
    dispatch(optimisticStatusUpdate({ id, status: 'Rejected' }));
    toast.loading('Rejecting quotation...');

    try {
      await dispatch(updateQuotationStatus({ 
        id, 
        status: 'Rejected',
        rejectionReason: reason,
        userInfo: { name: user.name, role: user.role }
      })).unwrap();
      toast.dismiss();
      toast.success('Quotation rejected');
    } catch (error: any) {
      dispatch(rollbackStatusUpdate({ id, previousStatus }));
      toast.dismiss();
      toast.error(error?.message || 'Failed to reject quotation');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !quotation) {
    return (
      <EmptyState
        title="Quotation Not Found"
        description="The requested quotation could not be found."
        action={
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        }
      />
    );
  }

  const actions = user ? getAvailableActions(user.role, quotation.status) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => handleNavigateWithConfirmation('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Quotation Details</h1>
          <p className="text-sm text-muted-foreground">View and manage quotation information</p>
        </div>
      </div>

      {/* Main Details Card */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              {isEditing && actions?.canEdit ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client Name</label>
                  <Input
                    value={editedData.client}
                    onChange={(e) => handleFieldChange('client', e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{quotation.client}</h2>
                  <p className="text-sm text-muted-foreground">{quotation.id}</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={quotation.status} />
              {actions?.canEdit && !isEditing && (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit2 className="mr-1 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Amount Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              {isEditing && actions?.canEdit ? (
                <Input
                  type="number"
                  value={editedData.amount}
                  onChange={(e) => handleFieldChange('amount', Number(e.target.value))}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-2xl font-semibold">{formatCurrency(quotation.amount)}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="mt-1 text-sm">{formatDate(quotation.last_updated)}</p>
            </div>
          </div>

          {/* Description */}
          {isEditing && actions?.canEdit ? (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <Textarea
                value={editedData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="mt-1 min-h-[80px]"
              />
            </div>
          ) : (
            quotation.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-sm">{quotation.description}</p>
              </div>
            )
          )}

          {/* Rejection Reason Display */}
          {quotation.status === 'Rejected' && quotation.rejectionReason && !isEditing && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <label className="text-sm font-medium text-red-900">Rejection Reason</label>
              <p className="mt-1 text-sm text-red-800">{quotation.rejectionReason}</p>
            </div>
          )}

          {/* Edit Actions */}
          {isEditing && actions?.canEdit && (
            <div className="flex gap-2 border-t pt-4">
              <Button onClick={handleSave}>
                <Save className="mr-1 h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}

          {/* Status Actions */}
          {!isEditing && actions && (actions.canApprove || actions.canReject) && (
            <div className="flex gap-2 border-t pt-4">
              {actions.canApprove && (
                <Button onClick={handleApprove}>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Approve Quotation
                </Button>
              )}
              {actions.canReject && (
                <RejectDialog onReject={handleReject} />
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Line Items Table */}
      {quotation.lineItems && quotation.lineItems.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Line Items</h3>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Sr</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotation.lineItems.map((item) => (
                  <TableRow key={item.sr}>
                    <TableCell className="font-medium">{item.sr}</TableCell>
                    <TableCell>{item.item}</TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          {(quotation.subtotal || quotation.gst || quotation.freight) && (
            <div className="mt-6 space-y-2 border-t pt-4">
              {quotation.subtotal && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(quotation.subtotal)}</span>
                </div>
              )}
              {quotation.gst && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%):</span>
                  <span className="font-medium">{formatCurrency(quotation.gst)}</span>
                </div>
              )}
              {quotation.freight && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Freight:</span>
                  <span className="font-medium">{formatCurrency(quotation.freight)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Grand Total:</span>
                <span>{formatCurrency(quotation.amount)}</span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Status Timeline */}
      {quotation.statusHistory && quotation.statusHistory.length > 0 && (
        <StatusTimeline history={quotation.statusHistory} />
      )}

      {/* Comments Section */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Activity & Comments</h3>
        </div>
        <CommentsSection
          quotation={quotation}
          user={user!}
          commentsLoading={commentsLoading}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
        />
      </Card>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowUnsavedDialog(false);
                setNextLocation(null);
              }}
            >
              Stay on Page
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsDirty(false);
                setShowUnsavedDialog(false);
                if (nextLocation) {
                  navigate(nextLocation);
                  setNextLocation(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Leave Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
