import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Quotation, Comment, Reply, Status } from '@/lib/types';
import { mockApi } from '@/lib/mockApi';

interface QuotationsState {
  quotations: Quotation[];
  currentQuotation: Quotation | null;
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    status: string;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

const initialState: QuotationsState = {
  quotations: [],
  currentQuotation: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    status: 'all',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 8,
    totalItems: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchQuotations = createAsyncThunk(
  'quotations/fetchQuotations',
  async (params: { search?: string; status?: string; page?: number; limit?: number } = {}) => {
    const response = await mockApi.getQuotations(params);
    return response;
  }
);

export const fetchQuotation = createAsyncThunk(
  'quotations/fetchQuotation',
  async (id: string) => {
    const response = await mockApi.getQuotation(id);
    return response;
  }
);

export const updateQuotationStatus = createAsyncThunk(
  'quotations/updateStatus',
  async ({ id, status }: { id: string; status: Status }, { rejectWithValue }) => {
    try {
      const response = await mockApi.updateQuotation(id, { status });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateQuotationDetails = createAsyncThunk(
  'quotations/updateDetails',
  async ({ id, updates }: { id: string; updates: Partial<Quotation> }, { rejectWithValue }) => {
    try {
      const response = await mockApi.updateQuotation(id, updates);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'quotations/addComment',
  async ({
    quotationId,
    comment,
  }: {
    quotationId: string;
    comment: Omit<Comment, 'id' | 'timestamp'>;
  }) => {
    const response = await mockApi.addComment(quotationId, comment);
    return { quotationId, comment: response };
  }
);

export const addReply = createAsyncThunk(
  'quotations/addReply',
  async ({
    quotationId,
    commentId,
    reply,
  }: {
    quotationId: string;
    commentId: number;
    reply: Omit<Reply, 'id' | 'timestamp'>;
  }) => {
    const response = await mockApi.addReply(quotationId, commentId, reply);
    return { quotationId, commentId, reply: response };
  }
);

const quotationsSlice = createSlice({
  name: 'quotations',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ search?: string; status?: string }>) => {
      if (action.payload.search !== undefined) {
        state.filters.search = action.payload.search;
        // Reset to first page when searching
        state.pagination.currentPage = 1;
      }
      if (action.payload.status !== undefined) {
        state.filters.status = action.payload.status;
        // Reset to first page when filtering by status
        state.pagination.currentPage = 1;
      }
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setPagination: (state, action: PayloadAction<{ totalItems: number; totalPages: number }>) => {
      state.pagination.totalItems = action.payload.totalItems;
      state.pagination.totalPages = action.payload.totalPages;
    },
    clearError: (state) => {
      state.error = null;
    },
    optimisticStatusUpdate: (state, action: PayloadAction<{ id: string; status: Status }>) => {
      // Optimistic update for list
      const quotation = state.quotations.find(q => q.id === action.payload.id);
      if (quotation) {
        quotation.status = action.payload.status;
      }
      // Optimistic update for current quotation
      if (state.currentQuotation?.id === action.payload.id) {
        state.currentQuotation.status = action.payload.status;
      }
    },
    rollbackStatusUpdate: (state, action: PayloadAction<{ id: string; previousStatus: Status }>) => {
      // Rollback on error
      const quotation = state.quotations.find(q => q.id === action.payload.id);
      if (quotation) {
        quotation.status = action.payload.previousStatus;
      }
      if (state.currentQuotation?.id === action.payload.id) {
        state.currentQuotation.status = action.payload.previousStatus;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch quotations
      .addCase(fetchQuotations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.loading = false;
        state.quotations = action.payload.data;
        state.pagination.totalItems = action.payload.totalItems;
        state.pagination.totalPages = action.payload.totalPages;
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch quotations';
      })
      // Fetch single quotation
      .addCase(fetchQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuotation = action.payload;
      })
      .addCase(fetchQuotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch quotation';
      })
      // Update status
      .addCase(updateQuotationStatus.fulfilled, (state, action) => {
        const index = state.quotations.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          state.quotations[index] = action.payload;
        }
        if (state.currentQuotation?.id === action.payload.id) {
          state.currentQuotation = action.payload;
        }
      })
      .addCase(updateQuotationStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update details
      .addCase(updateQuotationDetails.fulfilled, (state, action) => {
        const index = state.quotations.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          state.quotations[index] = action.payload;
        }
        if (state.currentQuotation?.id === action.payload.id) {
          state.currentQuotation = action.payload;
        }
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.currentQuotation?.id === action.payload.quotationId) {
          state.currentQuotation.comments.push(action.payload.comment);
        }
      })
      // Add reply
      .addCase(addReply.fulfilled, (state, action) => {
        if (state.currentQuotation?.id === action.payload.quotationId) {
          const comment = state.currentQuotation.comments.find(
            c => c.id === action.payload.commentId
          );
          if (comment) {
            if (!comment.replies) comment.replies = [];
            comment.replies.push(action.payload.reply);
          }
        }
      });
  },
});

export const { setFilters, setPage, setPagination, clearError, optimisticStatusUpdate, rollbackStatusUpdate } =
  quotationsSlice.actions;
export default quotationsSlice.reducer;
