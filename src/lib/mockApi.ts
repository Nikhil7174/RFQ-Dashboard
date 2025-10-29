import { Quotation, Comment, Reply } from './types';

/**
 * Mock API service with artificial 1s delay
 * Simulates backend API calls
 */

const DELAY = 1000; // 1 second delay

const delay = (ms: number = DELAY) => new Promise(resolve => setTimeout(resolve, ms));
const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

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
  {
    id: 'Q-106',
    client: 'Global Construction Ltd',
    amount: 125000.00,
    status: 'Pending',
    last_updated: new Date(Date.now() - 86400000).toISOString(),
    description: 'Large scale commercial project with multiple phases',
    comments: [],
  },
  {
    id: 'Q-107',
    client: 'TechCorp Solutions',
    amount: 78900.50,
    status: 'Approved',
    last_updated: new Date(Date.now() - 172800000).toISOString(),
    description: 'Data center electrical infrastructure',
    comments: [],
  },
  {
    id: 'Q-108',
    client: 'Metro Builders',
    amount: 23400.75,
    status: 'Rejected',
    last_updated: new Date(Date.now() - 259200000).toISOString(),
    description: 'Residential complex electrical work',
    comments: [],
  },
  {
    id: 'Q-109',
    client: 'Industrial Systems Inc',
    amount: 156700.00,
    status: 'Pending',
    last_updated: new Date(Date.now() - 43200000).toISOString(),
    description: 'Heavy industrial electrical installation',
    comments: [],
  },
  {
    id: 'Q-110',
    client: 'Smart City Developers',
    amount: 98750.25,
    status: 'Approved',
    last_updated: new Date(Date.now() - 86400000).toISOString(),
    description: 'Smart city infrastructure project',
    comments: [],
  },
  {
    id: 'Q-111',
    client: 'Green Energy Corp',
    amount: 67800.00,
    status: 'Pending',
    last_updated: new Date(Date.now() - 129600000).toISOString(),
    description: 'Renewable energy electrical systems',
    comments: [],
  },
  {
    id: 'Q-112',
    client: 'Urban Planning Group',
    amount: 45600.00,
    status: 'Rejected',
    last_updated: new Date(Date.now() - 345600000).toISOString(),
    description: 'Urban development electrical planning',
    comments: [],
  },
  {
    id: 'Q-113',
    client: 'Future Tech Ltd',
    amount: 112300.50,
    status: 'Approved',
    last_updated: new Date(Date.now() - 216000000).toISOString(),
    description: 'Advanced technology facility electrical work',
    comments: [],
  },
  {
    id: 'Q-114',
    client: 'Mega Construction Co',
    amount: 189500.75,
    status: 'Pending',
    last_updated: new Date(Date.now() - 172800000).toISOString(),
    description: 'Mega construction project electrical systems',
    comments: [],
  },
  {
    id: 'Q-115',
    client: 'Innovation Hub',
    amount: 54300.00,
    status: 'Approved',
    last_updated: new Date(Date.now() - 259200000).toISOString(),
    description: 'Innovation center electrical infrastructure',
    comments: [],
  },
  {
    id: 'Q-116',
    client: 'City Infrastructure',
    amount: 234600.00,
    status: 'Pending',
    last_updated: new Date(Date.now() - 43200000).toISOString(),
    description: 'City-wide infrastructure electrical upgrade',
    comments: [],
  },
];

export const mockApi = {
  // Get all quotations with optional filters and pagination
  getQuotations: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
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

    // Calculate pagination
    const page = params?.page || 1;
    const limit = params?.limit || 8;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filtered.slice(startIndex, endIndex).map((q) => deepClone(q));

    return {
      data: paginatedData,
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
    };
  },

  // Get single quotation by ID
  getQuotation: async (id: string) => {
    await delay();
    const quotation = quotationsData.find(q => q.id === id);
    if (!quotation) throw new Error('Quotation not found');
    return deepClone(quotation);
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

    return deepClone(quotationsData[index]);
  },

  // Add comment to quotation
  addComment: async (quotationId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    await delay();

    const index = quotationsData.findIndex(q => q.id === quotationId);
    if (index === -1) throw new Error('Quotation not found');

    const newComment: Comment = {
      ...comment,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      replies: [],
    };

    const current = quotationsData[index];
    quotationsData[index] = {
      ...current,
      comments: [...current.comments, newComment],
      last_updated: new Date().toISOString(),
    };

    return deepClone(newComment);
  },

  // Add reply to comment
  addReply: async (quotationId: string, commentId: number, reply: Omit<Reply, 'id' | 'timestamp'>) => {
    await delay();

    const qIndex = quotationsData.findIndex(q => q.id === quotationId);
    if (qIndex === -1) throw new Error('Quotation not found');

    const newReply: Reply = {
      ...reply,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };

    const current = quotationsData[qIndex];
    const updatedComments = current.comments.map((c) => {
      if (c.id !== commentId) return c;
      const existingReplies = c.replies ? [...c.replies] : [];
      return {
        ...c,
        replies: [...existingReplies, newReply],
      } as Comment;
    });

    quotationsData[qIndex] = {
      ...current,
      comments: updatedComments,
      last_updated: new Date().toISOString(),
    };

    return deepClone(newReply);
  },
};
