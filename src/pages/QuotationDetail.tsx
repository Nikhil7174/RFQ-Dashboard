import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuotationDetail } from '@/features/quotations/hooks/useQuotationDetail';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusPill } from '@/components/StatusPill';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { getAvailableActions } from '@/lib/permissions';
import { ArrowLeft, Edit2, Save, X, MessageSquare } from 'lucide-react';
import { CommentsSection } from '@/features/quotations/components/CommentsSection';
import { useAppDispatch } from '@/store/hooks';
import { updateQuotationStatus, optimisticStatusUpdate, rollbackStatusUpdate } from '@/store/slices/quotationsSlice';
import { toast } from 'sonner';

export default function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  if (!id) {
    navigate('/');
    return null;
  }

  const { quotation, loading, error, user, handleUpdateDetails } = useQuotationDetail(id);

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    client: '',
    amount: 0,
  });

  const handleEdit = () => {
    if (quotation) {
      setEditedData({
        client: quotation.client,
        amount: quotation.amount,
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    await handleUpdateDetails(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleStatusChange = async (newStatus: 'Approved' | 'Rejected') => {
    if (!quotation) return;

    const previousStatus = quotation.status;
    dispatch(optimisticStatusUpdate({ id, status: newStatus }));
    toast.loading('Updating status...');

    try {
      await dispatch(updateQuotationStatus({ id, status: newStatus })).unwrap();
      toast.dismiss();
      toast.success(`Quotation ${newStatus.toLowerCase()} successfully`);
    } catch (error: any) {
      dispatch(rollbackStatusUpdate({ id, previousStatus }));
      toast.dismiss();
      toast.error(error || 'Failed to update status');
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
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
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
              {isEditing ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client Name</label>
                  <Input
                    value={editedData.client}
                    onChange={(e) => setEditedData({ ...editedData, client: e.target.value })}
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
              {isEditing ? (
                <Input
                  type="number"
                  value={editedData.amount}
                  onChange={(e) => setEditedData({ ...editedData, amount: Number(e.target.value) })}
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
          {quotation.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="mt-1 text-sm">{quotation.description}</p>
            </div>
          )}

          {/* Edit Actions */}
          {isEditing && (
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
                <Button onClick={() => handleStatusChange('Approved')}>
                  Approve Quotation
                </Button>
              )}
              {actions.canReject && (
                <Button variant="destructive" onClick={() => handleStatusChange('Rejected')}>
                  Reject Quotation
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Comments Section */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Activity & Comments</h3>
        </div>
        <CommentsSection quotationId={id} />
      </Card>
    </div>
  );
}
