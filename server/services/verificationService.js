import { supabase } from '../config/supabase.js';

/**
 * Map a DB row (snake_case) to the API verification shape.
 */
export function mapVerificationRow(row) {
  if (!row) return null;
  return {
    confirmsExisting: row.confirms_existing || 0,
    marksFixed: row.marks_fixed || 0,
    communityPhotos: row.community_photos || [],
    updates: row.updates || [],
    lastVerifiedAt: row.last_verified_at ? new Date(row.last_verified_at).toISOString() : new Date().toISOString(),
  };
}

/**
 * Get verification stats for an issue.
 * Returns null if none exist (route will supply empty stats).
 */
export async function getVerification(issueId) {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('issue_id', issueId)
    .maybeSingle();

  if (error) {
    console.error(`[VerificationService] getVerification(${issueId}) failed:`, error.message);
    throw new Error(`Failed to fetch verification: ${error.message}`);
  }

  return mapVerificationRow(data);
}

/**
 * Atomically update verification stats for an issue.
 * Uses upsert on the unique issue_id — creates the row if missing,
 * otherwise overwrites with the new computed stats.
 */
export async function setVerification(issueId, stats) {
  const row = {
    issue_id: issueId,
    confirms_existing: stats.confirmsExisting || 0,
    marks_fixed: stats.marksFixed || 0,
    community_photos: stats.communityPhotos || [],
    updates: stats.updates || [],
    last_verified_at: stats.lastVerifiedAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('verifications')
    .upsert(row, { onConflict: 'issue_id' })
    .select()
    .single();

  if (error) {
    console.error(`[VerificationService] setVerification(${issueId}) failed:`, error.message);
    throw new Error(`Failed to save verification: ${error.message}`);
  }

  return mapVerificationRow(data);
}