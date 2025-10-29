import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchQuotation,
  updateQuotationDetails,
  addComment,
  addReply,
} from '@/store/slices/quotationsSlice';
import { Comment, Reply } from '@/lib/types';
import { toast } from 'sonner';

export const useQuotationDetail = (id: string) => {
  const dispatch = useAppDispatch();
  const { currentQuotation, loading, error } = useAppSelector((state) => state.quotations);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchQuotation(id));
  }, [dispatch, id]);

  const handleUpdateDetails = useCallback(
    async (updates: any) => {
      try {
        await dispatch(updateQuotationDetails({ id, updates })).unwrap();
        toast.success('Quotation updated successfully');
      } catch (error: any) {
        toast.error(error?.message || 'Failed to update quotation');
      }
    },
    [dispatch, id]
  );

  const handleAddComment = useCallback(
    async (text: string) => {
      if (!user) return;

      const comment: Omit<Comment, 'id' | 'timestamp'> = {
        author: user.name,
        role: user.role,
        text,
        replies: [],
      };

      try {
        await dispatch(addComment({ quotationId: id, comment })).unwrap();
        toast.success('Comment added successfully');
      } catch (error: any) {
        toast.error(error?.message || 'Failed to add comment');
      }
    },
    [dispatch, id, user]
  );

  const handleAddReply = useCallback(
    async (commentId: number, text: string) => {
      if (!user) return;

      const reply: Omit<Reply, 'id' | 'timestamp'> = {
        author: user.name,
        role: user.role,
        text,
      };

      try {
        await dispatch(addReply({ quotationId: id, commentId, reply })).unwrap();
        toast.success('Reply added successfully');
      } catch (error: any) {
        toast.error(error?.message || 'Failed to add reply');
      }
    },
    [dispatch, id, user]
  );

  return {
    quotation: currentQuotation,
    loading,
    error,
    user,
    handleUpdateDetails,
    handleAddComment,
    handleAddReply,
  };
};
