import { supabase } from '../config/supabase.js';

/**
 * Map a DB row (snake_case) to the API timeline event shape.
 */
export function mapTimelineRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    issueId: row.issue_id,
    type: row.type,
    timestamp: new Date(row.timestamp).toISOString(),
    user: row.user_data || { id: 'anonymous', name: 'Anonymous' },
    photo: row.photo || null,
    status: row.status || 'reported',
    notes: row.notes || '',
    metadata: row.metadata || {},
  };
}

/**
 * Get all timeline events for an issue, oldest first.
 */
export async function getTimeline(issueId) {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('issue_id', issueId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error(`[TimelineService] getTimeline(${issueId}) failed:`, error.message);
    throw new Error(`Failed to fetch timeline: ${error.message}`);
  }

  return (data || []).map(mapTimelineRow);
}

/**
 * Append a single timeline event for an issue.
 */
export async function addTimelineEvent(event) {
  const row = {
    id: event.id,
    issue_id: event.issueId,
    type: event.type,
    timestamp: event.timestamp || new Date().toISOString(),
    user_data: event.user || { id: 'anonymous', name: 'Anonymous' },
    photo: event.photo || null,
    status: event.status || 'reported',
    notes: event.notes || '',
    metadata: event.metadata || {},
  };

  const { data, error } = await supabase
    .from('timeline_events')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error(`[TimelineService] addTimelineEvent failed:`, error.message);
    throw new Error(`Failed to add timeline event: ${error.message}`);
  }

  return mapTimelineRow(data);
}