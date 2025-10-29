import { useState, useEffect, useCallback, useRef } from 'react';
import { canAddComment, canAddReply, canViewReply } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';
import { Comment, Quotation, User } from '@/lib/types';
import { storage } from '@/lib/storage';

interface CommentsSectionProps {
  quotation: Quotation;
  user: User;
  commentsLoading?: boolean;
  onAddComment: (text: string) => Promise<void>;
  onAddReply: (commentId: number, text: string) => Promise<void>;
}

export const CommentsSection = ({ quotation, user, commentsLoading, onAddComment, onAddReply }: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [draftRestored, setDraftRestored] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  if (!quotation || !user) return null;

  // Restore drafts on mount
  useEffect(() => {
    const draft = storage.getCommentDraft(quotation.id);
    if (draft) {
      if (draft.comment) {
        setNewComment(draft.comment);
        setDraftRestored(true);
        // Hide the indicator after 3 seconds
        setTimeout(() => setDraftRestored(false), 3000);
      }
      if (draft.replies && Object.keys(draft.replies).length > 0) {
        setReplyTexts(draft.replies);
      }
    }
  }, [quotation.id]);

  // Auto-save draft every 2 seconds
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (newComment.trim() || Object.keys(replyTexts).some(key => replyTexts[Number(key)]?.trim())) {
      autoSaveTimerRef.current = setTimeout(() => {
        storage.setCommentDraft(quotation.id, {
          comment: newComment,
          replies: replyTexts,
        });
      }, 2000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [newComment, replyTexts, quotation.id]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    await onAddComment(newComment);
    setNewComment('');
    // Clear draft for comment
    const draft = storage.getCommentDraft(quotation.id);
    if (draft) {
      storage.setCommentDraft(quotation.id, {
        comment: '',
        replies: draft.replies,
      });
    }
  };

  const handleSubmitReply = async (commentId: number) => {
    const text = replyTexts[commentId] || replyText;
    if (!text.trim()) return;
    await onAddReply(commentId, text);
    
    // Clear this specific reply draft
    const newReplyTexts = { ...replyTexts };
    delete newReplyTexts[commentId];
    setReplyTexts(newReplyTexts);
    setReplyText('');
    setReplyTo(null);
    
    // Update storage
    const draft = storage.getCommentDraft(quotation.id);
    if (draft) {
      storage.setCommentDraft(quotation.id, {
        comment: draft.comment,
        replies: newReplyTexts,
      });
    }
  };

  const handleReplyTextChange = (commentId: number, text: string) => {
    setReplyTexts(prev => ({ ...prev, [commentId]: text }));
    if (commentId === replyTo) {
      setReplyText(text);
    }
  };

  const toggleReplies = (commentId: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = diffInMs / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
  };

  const renderComment = (comment: Comment) => {
    const visibleReplies = comment.replies?.filter((reply) =>
      canViewReply(user.role, reply.role)
    ) || [];

    return (
      <div key={comment.id} className="space-y-3">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-muted">
              {getInitials(comment.author)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{comment.author}</span>
              <span className="text-xs text-muted-foreground capitalize">{comment.role.replace('_', ' ')}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</span>
            </div>
            <p className="text-sm">{comment.text}</p>
            <div className="flex items-center gap-2 pt-1">
              {visibleReplies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary hover:bg-white hover:text-primary"
                  onClick={() => toggleReplies(comment.id)}
                >
                  {expandedComments.has(comment.id) ? 'Hide' : 'View'} replies ({visibleReplies.length})
                </Button>
              )}
              {canAddReply(user.role) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary hover:bg-white hover:text-primary"
                  onClick={() => setReplyTo(comment.id)}
                >
                  Reply
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Replies */}
        {expandedComments.has(comment.id) && visibleReplies.length > 0 && (
          <div className="ml-11 space-y-3 border-l-2 border-muted pl-4">
            {visibleReplies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-muted">
                    {getInitials(reply.author)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{reply.author}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {reply.role.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(reply.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm">{reply.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply Input */}
        {replyTo === comment.id && (
          <div className="ml-11 flex gap-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyTexts[comment.id] || replyText}
              onChange={(e) => handleReplyTextChange(comment.id, e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                <Send className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setReplyTo(null);
                  // Keep the draft but hide the input
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Add Comment */}
      {canAddComment(user.role) && (
        <div className="space-y-2">
          <div className="relative">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            {draftRestored && (
              <div className="absolute top-2 right-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Draft restored
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
              <Send className="mr-2 h-4 w-4" />
              Post Comment
            </Button>
            <span className="text-xs text-muted-foreground">Auto-saves every 2 seconds</span>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {commentsLoading ? (
          <div className="py-8 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : quotation.comments.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <MessageSquare className="mx-auto mb-2 h-8 w-8" />
            <p>No comments yet</p>
          </div>
        ) : (
          quotation.comments.map(renderComment)
        )}
      </div>
    </div>
  );
};
