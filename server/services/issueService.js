import { supabase } from '../config/supabase.js';

/**
 * Map a DB row (snake_case) to the API/frontend shape (camelCase).
 */
export function mapIssueRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category,
    severity: row.severity,
    status: row.status,
    location: row.location || { lat: 0, lng: 0 },
    address: row.address || '',
    localityId: row.locality_id || 'custom-locality',
    photos: row.photos || [],
    reportedBy: row.reported_by || null,
    reportedAt: row.reported_at ? new Date(row.reported_at).toISOString() : null,
    resolvedAt: row.resolved_at ? new Date(row.resolved_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    verification: row.verification || undefined,
    timeline: row.timeline || undefined,
    duplicateGroupId: row.duplicate_group_id || undefined,
    duplicateOf: row.duplicate_of || undefined,
  };
}

/**
 * Map an API/insert payload (camelCase) to a DB row (snake_case).
 */
export function mapIssuePayload(issue) {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description || '',
    category: issue.category,
    severity: issue.severity,
    status: issue.status || 'reported',
    location: issue.location || { lat: 0, lng: 0 },
    address: issue.address || '',
    locality_id: issue.localityId || 'custom-locality',
    photos: issue.photos || [],
    reported_by: issue.reportedBy || null,
    reported_at: issue.reportedAt || new Date().toISOString(),
    resolved_at: issue.resolvedAt || null,
    updated_at: issue.updatedAt || new Date().toISOString(),
    verification: issue.verification || null,
    timeline: issue.timeline || null,
    duplicate_group_id: issue.duplicateGroupId || null,
    duplicate_of: issue.duplicateOf || null,
  };
}

/**
 * Get all issues, newest first.
 */
export async function getIssues() {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .order('reported_at', { ascending: false });

  if (error) {
    console.error('[IssueService] getIssues failed:', error.message);
    throw new Error(`Failed to fetch issues: ${error.message}`);
  }

  return (data || []).map(mapIssueRow);
}

/**
 * Get a single issue by ID.
 */
export async function getIssueById(id) {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error(`[IssueService] getIssueById(${id}) failed:`, error.message);
    throw new Error(`Failed to fetch issue: ${error.message}`);
  }

  return mapIssueRow(data);
}

/**
 * Create a new issue.
 */
export async function createIssue(issue) {
  const row = mapIssuePayload(issue);

  const { data, error } = await supabase
    .from('issues')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('[IssueService] createIssue failed:', error.message);
    throw new Error(`Failed to create issue: ${error.message}`);
  }

  return mapIssueRow(data);
}

/**
 * Update an issue by ID with partial updates.
 */
export async function updateIssue(id, updates) {
  const dbUpdates = { ...updates };
  // Translate camelCase keys from the API to snake_case DB columns
  const keyMap = {
    reportedBy: 'reported_by',
    reportedAt: 'reported_at',
    resolvedAt: 'resolved_at',
    updatedAt: 'updated_at',
    localityId: 'locality_id',
    duplicateGroupId: 'duplicate_group_id',
    duplicateOf: 'duplicate_of',
  };
  for (const [camel, snake] of Object.entries(keyMap)) {
    if (camel in dbUpdates) {
      dbUpdates[snake] = dbUpdates[camel];
      delete dbUpdates[camel];
    }
  }

  dbUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('issues')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`[IssueService] updateIssue(${id}) failed:`, error.message);
    throw new Error(`Failed to update issue: ${error.message}`);
  }

  return mapIssueRow(data);
}

/**
 * Delete an issue by ID.
 * Cascades to verifications and timeline_events via FK constraints.
 * Returns true if deleted, false if not found.
 */
export async function deleteIssue(id) {
  const { data, error } = await supabase
    .from('issues')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    console.error(`[IssueService] deleteIssue(${id}) failed:`, error.message);
    throw new Error(`Failed to delete issue: ${error.message}`);
  }

  return (data || []).length > 0;
}