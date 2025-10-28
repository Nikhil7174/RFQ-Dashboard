// Core type definitions for the application
export type Role = 'manager' | 'sales_rep' | 'viewer';
export type Status = 'Pending' | 'Approved' | 'Rejected';

export interface Reply {
  id: number;
  author: string;
  role: Role;
  text: string;
  timestamp: string;
}

export interface Comment {
  id: number;
  author: string;
  role: Role;
  text: string;
  timestamp: string;
  replies?: Reply[];
}

export interface Quotation {
  id: string;
  client: string;
  amount: number;
  status: Status;
  last_updated: string;
  description?: string;
  comments: Comment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
