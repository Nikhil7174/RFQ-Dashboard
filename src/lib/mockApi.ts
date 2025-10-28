import { Quotation, Comment, Reply } from './types';

/**
 * Mock API service with artificial 1s delay
 * Simulates backend API calls
 */

const DELAY = 1000; // 1 second delay

const delay = (ms: number = DELAY) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
let quotationsData: Quotation[] = [
  {
    id: 'Q-101',
    client: 'Acme Corp',
    amount: 36034.20,
    status: 'Pending',
    last_updated: new Date().toISOString(),
    description: 'Need quote for 500m 25mm corr pipe, 40 medium fan boxes, 600m 20mm pvc med.',
    comments: [
      {
        id: 1,
        author: 'John Doe',
        role: 'sales_rep',
        text: 'Client requested discount.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        replies: [
          {
            id: 11,
            author: 'Jane Smith',
            role: 'manager',
            text: 'Approved 5% discount.',
            timestamp: new Date(Date.now() - 43200000).toISOString(),
          },
        ],
      },
    ],
  },
  {
    id: 'Q-102',
    client: 'BuildTech Industries',
    amount: 52000.00,
    status: 'Approved',
    last_updated: new Date(Date.now() - 172800000).toISOString(),
    description: 'Large order for GI conduits and fan boxes',
    comments: [],
  },
  {
    id: 'Q-103',
    client: 'Phoenix Constructions',
    amount: 18500.75,
    status: 'Rejected',
    last_updated: new Date(Date.now() - 259200000).toISOString(),
    description: 'Small electrical components order',
    comments: [
      {
        id: 2,
        author: 'Sarah Johnson',
        role: 'sales_rep',
        text: 'Client asked for better pricing',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
      },
    ],
  },
  {
    id: 'Q-104',
    client: 'Metro Developers',
    amount: 89200.50,
    status: 'Pending',
    last_updated: new Date(Date.now() - 43200000).toISOString(),
    description: 'Bulk order for commercial project',
    comments: [],
  },
  {
    id: 'Q-105',
    client: 'Summit Engineering',
    amount: 45600.00,
    status: 'Approved',
    last_updated: new Date(Date.now() - 432000000).toISOString(),
    description: 'Industrial piping and conduits',
    comments: [],
  },
];

export const mockApi = {
  // Get all quotations with optional filters
  getQuotations: async (params?: { search?: string; status?: string }) => {
    await delay();
    let filtered = [...quotationsData];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        q => q.client.toLowerCase().includes(search) || q.id.toLowerCase().includes(search)
      );
    }

    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(q => q.status === params.status);
    }

    return filtered;
  },

  // Get single quotation by ID
  getQuotation: async (id: string) => {
    await delay();
    const quotation = quotationsData.find(q => q.id === id);
    if (!quotation) throw new Error('Quotation not found');
    return quotation;
  },

  // Update quotation (status, client, amount)
  updateQuotation: async (id: string, updates: Partial<Quotation>) => {
    await delay();
    
    // Simulate occasional API error (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Failed to update quotation');
    }

    const index = quotationsData.findIndex(q => q.id === id);
    if (index === -1) throw new Error('Quotation not found');

    quotationsData[index] = {
      ...quotationsData[index],
      ...updates,
      last_updated: new Date().toISOString(),
    };

    return quotationsData[index];
  },

  // Add comment to quotation
  addComment: async (quotationId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    await delay();

    const quotation = quotationsData.find(q => q.id === quotationId);
    if (!quotation) throw new Error('Quotation not found');

    const newComment: Comment = {
      ...comment,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      replies: [],
    };

    quotation.comments.push(newComment);
    quotation.last_updated = new Date().toISOString();

    return newComment;
  },

  // Add reply to comment
  addReply: async (quotationId: string, commentId: number, reply: Omit<Reply, 'id' | 'timestamp'>) => {
    await delay();

    const quotation = quotationsData.find(q => q.id === quotationId);
    if (!quotation) throw new Error('Quotation not found');

    const comment = quotation.comments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found');

    const newReply: Reply = {
      ...reply,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };

    if (!comment.replies) comment.replies = [];
    comment.replies.push(newReply);
    quotation.last_updated = new Date().toISOString();

    return newReply;
  },
};
