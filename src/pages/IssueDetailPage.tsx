import { useParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CategoryBadge, StatusBadge, SeverityBadge } from '../components/ui/Badge';
import { TimelineFeed } from '../components/issue/TimelineFeed';
import { PhotoGallery } from '../components/issue/PhotoGallery';
import { IssueMiniMap } from '../components/issue/IssueMiniMap';
import { IssueCard } from '../components/issue/IssueCard';
import { VerificationActions } from '../components/community/VerificationActions';
import { CommunityFeed } from '../components/community/CommunityFeed';
import { useStore, useIssues } from '../store';
import type { Issue } from '../types/issue';

export const IssueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const issue = useStore((s) => s.issues.find((i) => i.id === id));
  const allIssues = useIssues();
  const selectIssue = useStore((s) => s.selectIssue);
  const flyTo = useStore((s) => s.flyTo);
  const verification = useStore((s) => id ? s.verifications[id] : null);
  const addConfirm = useStore((s) => s.addConfirm);
  const addMarkFixed = useStore((s) => s.addMarkFixed);
  const addPhoto = useStore((s) => s.addPhoto);
  const addComment = useStore((s) => s.addComment);

  const relatedIssues = allIssues.filter((i) => i.id !== id && i.category === issue?.category).slice(0, 3);

  if (!issue) {
    return (
      <div className="h-full flex flex-col bg-[var(--bg-page)]">
        <TopBar title="Issue" showBack />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[var(--text-muted)]">Issue not found</p>
            <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>Back to Map</Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const handleViewOnMap = () => { selectIssue(issue); flyTo(issue.location, 16); navigate('/'); };
  const handleShare = async () => {
    const url = `${window.location.origin}/issue/${issue.id}`;
    if (navigator.share) { try { await navigator.share({ title: issue.title, text: issue.description, url }); } catch {} }
    else { await navigator.clipboard.writeText(url); }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-page)]">
      <TopBar title="Issue" showBack rightAction={
        <button onClick={handleShare} className="flex items-center justify-center w-7 h-7 hover:bg-[var(--bg-muted)] transition-colors" style={{ borderRadius: 'var(--radius-sm)' }} aria-label="Share">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.475l6.733-3.366A2.52 2.52 0 0 1 13 4.5Z" />
          </svg>
        </button>
      } />

      <div className="flex-1 overflow-y-auto">
        {/* Photo Gallery — editorial full-bleed */}
        <PhotoGallery photos={issue.photos} title={issue.title} />

        {/* Content area with max-width */}
        <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--page-padding)] py-6 space-y-6">
          {/* Title and badges */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CategoryBadge category={issue.category} />
              <StatusBadge status={issue.status} />
              <SeverityBadge severity={issue.severity} />
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[var(--text-primary)] leading-tight">{issue.title}</h1>
          </div>

          {/* Description — editorial pull-quote style */}
          <div className="border-l-2 border-[var(--accent)] pl-4">
            <p className="text-base text-[var(--text-secondary)] leading-relaxed italic">{issue.description}</p>
          </div>

          {/* Mini Map */}
          <Card padding="none">
            <IssueMiniMap location={issue.location} title={issue.title} />
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{issue.address}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{issue.location.lat.toFixed(6)}, {issue.location.lng.toFixed(6)}</p>
                </div>
                <button onClick={handleViewOnMap} className="text-xs uppercase tracking-wider text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">Open Map</button>
              </div>
            </div>
          </Card>

          {/* Reported By */}
          <Card>
            <CardHeader><CardTitle>Reported</CardTitle></CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border border-[var(--border)] bg-[var(--bg-muted)] flex items-center justify-center text-sm font-medium text-[var(--text-primary)]" style={{ borderRadius: 'var(--radius-sm)' }}>
                {issue.reportedBy?.name?.[0] || 'A'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">{issue.reportedBy?.name || 'Anonymous'}</p>
                <p className="text-xs text-[var(--text-muted)]">{formatDate(issue.reportedAt)}</p>
              </div>
              <span className="label text-[0.625rem]">{formatRelativeTime(issue.reportedAt)}</span>
            </div>
            {issue.resolvedAt && (
              <div className="mt-3 pt-3 border-t border-[var(--border-light)]">
                <div className="flex items-center gap-2 text-sm text-[var(--status-green)]">
                  <span>Resolved {formatDate(issue.resolvedAt)}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <div className="space-y-0">
              {[
                { label: 'Reported', icon: 'R', color: 'bg-[var(--status-blue)]', time: formatRelativeTime(issue.reportedAt), show: true },
                { label: 'Under Review', icon: '→', color: 'bg-[var(--status-yellow)]', show: ['under_review', 'work_started', 'in_progress', 'resolved', 'verified_resolved'].includes(issue.status) },
                { label: 'Work Started', icon: 'W', color: 'bg-[var(--status-blue)]', show: ['work_started', 'in_progress', 'resolved', 'verified_resolved'].includes(issue.status) },
                { label: 'In Progress', icon: '→', color: 'bg-[var(--status-yellow)]', show: ['in_progress', 'resolved', 'verified_resolved'].includes(issue.status) },
                { label: 'Resolved', icon: '✓', color: 'bg-[var(--status-green)]', show: ['resolved', 'verified_resolved'].includes(issue.status) },
              ].filter(s => s.show).map((step, idx, arr) => (
                <div key={step.label} className="flex gap-3 pb-4 relative">
                  {idx < arr.length - 1 && <div className="absolute left-[13px] top-7 bottom-0 w-px bg-[var(--border-light)]" />}
                  <div className={`relative z-10 flex-shrink-0 w-6 h-6 ${step.color} flex items-center justify-center`} style={{ borderRadius: 'var(--radius-sm)' }}>
                    <span className="text-white text-[9px] font-bold">{step.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{step.label}</p>
                    {step.time && <p className="text-xs text-[var(--text-muted)]">{step.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity Timeline */}
          {issue.timeline && issue.timeline.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
              <TimelineFeed events={issue.timeline} />
            </Card>
          )}

          {/* Related Issues */}
          {relatedIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Issues</CardTitle>
                <span className="label text-[0.625rem]">{relatedIssues.length} similar</span>
              </CardHeader>
              <div className="divide-y divide-[var(--border-light)]">
                {relatedIssues.map((related) => <IssueCard key={related.id} issue={related} compact />)}
              </div>
            </Card>
          )}

          {/* Community Verification */}
          {id && (
            <>
              <VerificationActions
                issueId={id}
                onConfirm={addConfirm}
                onMarkFixed={addMarkFixed}
                onPhotoUpload={(issueId, file) => addPhoto(issueId, URL.createObjectURL(file))}
                onComment={addComment}
                stats={verification ? {
                  confirmsExisting: verification.confirmsExisting,
                  marksFixed: verification.marksFixed,
                  communityPhotos: verification.communityPhotos.length,
                  updates: verification.updates.length,
                } : undefined}
              />
              {verification && verification.updates.length > 0 && <CommunityFeed updates={verification.updates} />}
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <Button variant="secondary" className="flex-1" onClick={() => navigate(-1)}>Back</Button>
            <Button variant="primary" className="flex-1" onClick={handleViewOnMap}>View on Map</Button>
          </div>
        </div>
      </div>
    </div>
  );
};