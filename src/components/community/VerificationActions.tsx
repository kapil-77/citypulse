import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardTitle } from '../ui/Card';
import { PhotoUploader } from '../ui/PhotoUploader';

interface VerificationActionsProps {
  issueId: string;
  onConfirm: (issueId: string) => void;
  onMarkFixed: (issueId: string) => void;
  onPhotoUpload: (issueId: string, file: File) => void;
  onComment: (issueId: string, comment: string) => void;
  stats?: {
    confirmsExisting: number;
    marksFixed: number;
    communityPhotos: number;
    updates: number;
  };
  className?: string;
}

export const VerificationActions = ({
  issueId,
  onConfirm,
  onMarkFixed,
  onPhotoUpload,
  onComment,
  stats,
  className = '',
}: VerificationActionsProps) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleConfirm = () => {
    setActiveAction('confirm');
    onConfirm(issueId);
    setTimeout(() => setActiveAction(null), 1000);
  };

  const handleMarkFixed = () => {
    setActiveAction('mark_fixed');
    onMarkFixed(issueId);
    setTimeout(() => setActiveAction(null), 1000);
  };

  const handlePhoto = (file: File) => {
    setActiveAction('photo');
    onPhotoUpload(issueId, file);
    setTimeout(() => setActiveAction(null), 1000);
  };

  const handleCommentSubmit = () => {
    if (!comment.trim()) return;
    setActiveAction('comment');
    onComment(issueId, comment);
    setComment('');
    setShowCommentInput(false);
    setTimeout(() => setActiveAction(null), 1000);
  };

  return (
    <Card padding="lg" className={className}>
      <div className="text-center mb-5">
        <CardTitle className="mb-2">Community Verification</CardTitle>
        <p className="text-sm text-[var(--text-secondary)]">
          Help confirm this issue still exists or has been fixed.
        </p>
      </div>

      {stats && (
        <div className="flex justify-center gap-6 mb-5 py-3 border-y border-[var(--border-light)]">
          <div className="text-center">
            <div className="text-lg font-semibold text-[var(--text-primary)]">{stats.confirmsExisting}</div>
            <div className="label text-[0.625rem]">Confirmations</div>
          </div>
          <div className="w-px bg-[var(--border-light)]" />
          <div className="text-center">
            <div className="text-lg font-semibold text-[var(--text-primary)]">{stats.marksFixed}</div>
            <div className="label text-[0.625rem]">Marked Fixed</div>
          </div>
          <div className="w-px bg-[var(--border-light)]" />
          <div className="text-center">
            <div className="text-lg font-semibold text-[var(--text-primary)]">{stats.communityPhotos}</div>
            <div className="label text-[0.625rem]">Photos</div>
          </div>
          <div className="w-px bg-[var(--border-light)]" />
          <div className="text-center">
            <div className="text-lg font-semibold text-[var(--text-primary)]">{stats.updates}</div>
            <div className="label text-[0.625rem]">Updates</div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center mb-3">
        <Button variant={activeAction === 'confirm' ? 'primary' : 'secondary'} size="sm" onClick={handleConfirm}>
          Still Exists
        </Button>
        <Button variant={activeAction === 'mark_fixed' ? 'primary' : 'secondary'} size="sm" onClick={handleMarkFixed}>
          Mark Fixed
        </Button>
        <PhotoUploader onPhotoCapture={handlePhoto}>
          <Button variant={activeAction === 'photo' ? 'primary' : 'secondary'} size="sm" onClick={() => {}}>
            Add Photo
          </Button>
        </PhotoUploader>
        <Button variant={showCommentInput ? 'primary' : 'secondary'} size="sm" onClick={() => setShowCommentInput(!showCommentInput)}>
          Comment
        </Button>
      </div>

      {showCommentInput && (
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add an update..."
            className="flex-1 px-3 py-2 text-sm border border-[var(--border)] bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
            style={{ borderRadius: 'var(--radius-sm)' }}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
          />
          <Button size="sm" onClick={handleCommentSubmit} disabled={!comment.trim()}>
            Send
          </Button>
        </div>
      )}

      {activeAction && (
        <div className="mt-3 text-center animate-fade-in">
          <span className="text-xs text-[var(--status-green)] font-medium">
            {activeAction === 'confirm' && 'Thanks for confirming!'}
            {activeAction === 'mark_fixed' && 'Thanks for the update!'}
            {activeAction === 'photo' && 'Photo added!'}
            {activeAction === 'comment' && 'Comment added!'}
          </span>
        </div>
      )}
    </Card>
  );
};