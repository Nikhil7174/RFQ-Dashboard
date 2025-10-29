import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchQuotations,
  setFilters,
  setPage,
  optimisticStatusUpdate,
  rollbackStatusUpdate,
  updateQuotationStatus,
} from '@/store/slices/quotationsSlice';
import { Status } from '@/lib/types';
import { toast } from 'sonner';

export const useQuotations = () => {
  const dispatch = useAppDispatch();
  const { quotations, loading, error, filters, pagination } = useAppSelector((state) => state.quotations);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchQuotations({
      ...filters,
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
    }));
  }, [dispatch, filters, pagination.currentPage, pagination.itemsPerPage]);

  const handleSearch = useCallback(
    (search: string) => {
      dispatch(setFilters({ search }));
    },
    [dispatch]
  );

  const handleStatusFilter = useCallback(
    (status: string) => {
      dispatch(setFilters({ status }));
    },
    [dispatch]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setPage(page));
    },
    [dispatch]
  );

  const handleOptimisticStatusUpdate = useCallback(
    async (id: string, newStatus: Status) => {
      const quotation = quotations.find((q) => q.id === id);
      if (!quotation || !user) return;

      const previousStatus = quotation.status;

      // Optimistic update
      dispatch(optimisticStatusUpdate({ id, status: newStatus }));
      toast.loading('Updating status...');

      try {
        await dispatch(updateQuotationStatus({ 
          id, 
          status: newStatus,
          userInfo: { name: user.name, role: user.role }
        })).unwrap();
        toast.dismiss();
        toast.success(`Quotation ${newStatus.toLowerCase()} successfully`);
      } catch (error: any) {
        // Rollback on error
        dispatch(rollbackStatusUpdate({ id, previousStatus }));
        toast.dismiss();
        toast.error(error || 'Failed to update status');
      }
    },
    [dispatch, quotations, user]
  );

  return {
    quotations,
    loading,
    error,
    filters,
    pagination,
    user,
    handleSearch,
    handleStatusFilter,
    handlePageChange,
    handleOptimisticStatusUpdate,
  };
};
