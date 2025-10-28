import { useState } from 'react';
import { useQuotationDetail } from '../hooks/useQuotationDetail';
import { useAppSelector } from '@/store/hooks';
import { canAddComment, canAddReply, canViewReply } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';
import { Comment } from '@/lib/types';

interface CommentsSectionProps {
  quotationId: string;
}

export const CommentsSection = ({ quotationId }: CommentsSectionProps) => {
  const { quotation, handleAddComment, handleAddReply } = useQuotationDetail(quotationId);
  const { user } = useAppSelector((state) => state.auth);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  if (!quotation || !user) return null;

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    await handleAddComment(newComment);
    setNewComment('');
  };

  const handleSubmitReply = async (commentId: number) => {
    if (!replyText.trim()) return;
    await handleAddReply(commentId, replyText);
    setReplyText('');
    setReplyTo(null);
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
                  className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                  onClick={() => toggleReplies(comment.id)}
                >
                  {expandedComments.has(comment.id) ? 'Hide' : 'View'} replies ({visibleReplies.length})
                </Button>
              )}
              {canAddReply(user.role) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary hover:bg-transparent"
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
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                <Send className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setReplyTo(null)}>
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
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
            <Send className="mr-2 h-4 w-4" />
            Post Comment
          </Button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {quotation.comments.length === 0 ? (
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
