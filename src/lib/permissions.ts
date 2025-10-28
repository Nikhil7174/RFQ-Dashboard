import { Role, Status } from './types';

/**
 * Permission utilities for role-based access control
 */

export const canApproveReject = (role: Role): boolean => {
  return role === 'manager';
};

export const canEditQuotation = (role: Role): boolean => {
  return role === 'manager';
};

export const canAddComment = (role: Role): boolean => {
  return role === 'manager' || role === 'sales_rep';
};

export const canAddReply = (role: Role): boolean => {
  return role === 'manager';
};

export const canViewReply = (userRole: Role, replyRole: Role): boolean => {
  // Replies are visible only to users with the same role as the replier
  return userRole === replyRole || userRole === 'manager';
};

export const isReadOnly = (role: Role): boolean => {
  return role === 'viewer';
};

export const getAvailableActions = (role: Role, currentStatus: Status) => {
  const actions = {
    canEdit: canEditQuotation(role),
    canApprove: canApproveReject(role) && currentStatus !== 'Approved',
    canReject: canApproveReject(role) && currentStatus !== 'Rejected',
    canComment: canAddComment(role),
    canReply: canAddReply(role),
  };

  return actions;
};
