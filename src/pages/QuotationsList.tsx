import { useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuotations } from '@/features/quotations/hooks/useQuotations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { StatusPill } from '@/components/StatusPill';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getAvailableActions } from '@/lib/permissions';
import { Search, FileText, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// Debounce utility
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function QuotationsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = React.useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  const {
    quotations,
    loading,
    error,
    filters,
    user,
    handleSearch,
    handleStatusFilter,
    handleOptimisticStatusUpdate,
  } = useQuotations();

  // Sync URL with filters
  useEffect(() => {
    const params: any = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    setSearchParams(params);
    handleSearch(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      handleStatusFilter(statusParam);
    }
  }, []);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleQuotationClick = (id: string) => {
    navigate(`/quotations/${id}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
  };

  if (error) {
    return (
      <EmptyState
        title="Error Loading Quotations"
        description={error}
        action={
          <Button onClick={() => window.location.reload()}>Retry</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">Manage and track all quotation requests</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-input"
              type="text"
              placeholder="Search by client name or ID (press / to focus)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <LoadingSpinner />
      ) : quotations.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground" />}
          title="No Quotations Found"
          description={
            filters.search || filters.status !== 'all'
              ? 'No quotations match your current filters. Try adjusting your search.'
              : 'Quotations are requests from customers for pricing. When a new RFQ arrives, it will appear here.'
          }
          action={
            (filters.search || filters.status !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchInput('');
                  handleStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {quotations.map((quotation) => {
            const actions = user ? getAvailableActions(user.role, quotation.status) : null;

            return (
              <Card
                key={quotation.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => handleQuotationClick(quotation.id)}
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{quotation.client}</h3>
                          <p className="text-sm text-muted-foreground">{quotation.id}</p>
                        </div>
                        <StatusPill status={quotation.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {formatCurrency(quotation.amount)}
                        </span>
                        <span>•</span>
                        <span>Updated {formatDate(quotation.last_updated)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {actions && (actions.canApprove || actions.canReject) && (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {actions.canApprove && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleOptimisticStatusUpdate(quotation.id, 'Approved')}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                        )}
                        {actions.canReject && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleOptimisticStatusUpdate(quotation.id, 'Rejected')}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React from 'react';
