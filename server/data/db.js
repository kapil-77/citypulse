import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'db.json');

/**
 * Read the entire database from disk.
 * Returns the parsed JSON object.
 */
export function readDB() {
  try {
    if (!existsSync(DB_PATH)) {
      return { issues: [], verifications: {}, localities: [], timeline: {} };
    }
    const raw = readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Failed to read database:', err.message);
    return { issues: [], verifications: {}, localities: [], timeline: {} };
  }
}

/**
 * Write the entire database to disk.
 */
export function writeDB(data) {
  try {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to write database:', err.message);
  }
}

/**
 * Get all issues.
 */
export function getIssues() {
  return readDB().issues || [];
}

/**
 * Get a single issue by ID.
 */
export function getIssueById(id) {
  return getIssues().find((i) => i.id === id) || null;
}

/**
 * Add a new issue to the database.
 */
export function addIssue(issue) {
  const db = readDB();
  db.issues = [issue, ...(db.issues || [])];
  writeDB(db);
  return issue;
}

/**
 * Update an issue by ID with partial updates.
 */
export function updateIssue(id, updates) {
  const db = readDB();
  const idx = (db.issues || []).findIndex((i) => i.id === id);
  if (idx === -1) return null;
  db.issues[idx] = { ...db.issues[idx], ...updates, updatedAt: new Date().toISOString() };
  writeDB(db);
  return db.issues[idx];
}

/**
 * Delete an issue by ID.
 */
export function deleteIssue(id) {
  const db = readDB();
  const before = db.issues.length;
  db.issues = (db.issues || []).filter((i) => i.id !== id);
  if (db.issues.length === before) return false;
  writeDB(db);
  return true;
}

/**
 * Get verification stats for an issue.
 */
export function getVerification(issueId) {
  const db = readDB();
  return (db.verifications || {})[issueId] || null;
}

/**
 * Set verification stats for an issue.
 */
export function setVerification(issueId, stats) {
  const db = readDB();
  db.verifications = db.verifications || {};
  db.verifications[issueId] = stats;
  writeDB(db);
  return stats;
}

/**
 * Get all localities.
 */
export function getLocalities() {
  return readDB().localities || [];
}

/**
 * Get timeline events for an issue.
 */
export function getTimeline(issueId) {
  const db = readDB();
  return (db.timeline || {})[issueId] || [];
}

/**
 * Set timeline events for an issue.
 */
export function setTimeline(issueId, events) {
  const db = readDB();
  db.timeline = db.timeline || {};
  db.timeline[issueId] = events;
  writeDB(db);
  return events;
}