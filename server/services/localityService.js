import { supabase } from '../config/supabase.js';

/**
 * Map a DB row (snake_case) to the API locality shape.
 */
export function mapLocalityRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    bounds: row.bounds || {},
    center: row.center || {},
  };
}

/**
 * Get all localities with live issue counts.
 * Computes issueCount and unresolvedCount via a SQL aggregation query.
 */
export async function getLocalities() {
  // Fetch all localities
  const { data: localityRows, error: localityError } = await supabase
    .from('localities')
    .select('*')
    .order('name', { ascending: true });

  if (localityError) {
    console.error('[LocalityService] getLocalities failed:', localityError.message);
    throw new Error(`Failed to fetch localities: ${localityError.message}`);
  }

  // Fetch all issues to compute live counts (lightweight: only ids and statuses)
  const { data: issueRows, error: issueError } = await supabase
    .from('issues')
    .select('id, locality_id, status');

  if (issueError) {
    console.error('[LocalityService] getLocalities (issues) failed:', issueError.message);
    throw new Error(`Failed to fetch locality issue counts: ${issueError.message}`);
  }

  // Compute counts per locality
  const countsByLocality = {};
  for (const issue of issueRows || []) {
    const locId = issue.locality_id || 'custom-locality';
    if (!countsByLocality[locId]) {
      countsByLocality[locId] = { issueCount: 0, unresolvedCount: 0 };
    }
    countsByLocality[locId].issueCount += 1;
    if (issue.status !== 'resolved' && issue.status !== 'verified_resolved') {
      countsByLocality[locId].unresolvedCount += 1;
    }
  }

  // Enrich each locality with live counts
  return (localityRows || []).map((row) => {
    const mapped = mapLocalityRow(row);
    const counts = countsByLocality[mapped.id] || { issueCount: 0, unresolvedCount: 0 };
    return {
      ...mapped,
      issueCount: counts.issueCount,
      unresolvedCount: counts.unresolvedCount,
    };
  });
}