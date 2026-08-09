#!/usr/bin/env node
/**
 * CityPulse One-Time Migration Script
 * ====================================
 * Imports data from the legacy JSON file (server/data/db.json) into
 * Supabase PostgreSQL, and uploads local filesystem images to Cloudinary.
 *
 * Usage:
 *   1. Apply db/schema.sql to your Supabase project first (SQL Editor or psql).
 *   2. Ensure server/.env has SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
 *   3. Run:  npm run migrate   (from the server/ directory)
 *      or:   node db/migrate.js
 *
 * The script is IDEMPOTENT: it truncates the four target tables before
 * inserting, so it can safely be re-run after a partial failure.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

// Load .env from the project root (one level up from server/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });
const DB_JSON_PATH = path.join(__dirname, '..', 'data', 'db.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env');
  process.exit(1);
}

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET in server/.env');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'citypulse';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve a legacy photo URL to a local file path.
 * Handles URLs like http://localhost:3001/uploads/photo-xxx.jpg
 * and relative paths like /uploads/photo-xxx.jpg.
 */
function resolveLocalFilePath(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/uploads\/([^/?#]+)$/);
  if (!match) return null;
  const filename = match[1];
  const fullPath = path.join(UPLOADS_DIR, filename);
  return fs.existsSync(fullPath) ? fullPath : null;
}

/**
 * Upload a single local image file to Cloudinary.
 * Returns the transformed photo object, or null on failure.
 */
async function uploadLocalImageToCloudinary(filePath, { uploadedBy, isBefore, uploadedAt }) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: CLOUDINARY_FOLDER,
      resource_type: 'image',
      transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }],
    });

    const thumbnailUrl = cloudinary.url(result.public_id, {
      transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto:good' }],
    });

    return {
      id: `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      url: result.secure_url,
      thumbnailUrl,
      public_id: result.public_id,
      uploadedAt: uploadedAt || new Date().toISOString(),
      uploadedBy: uploadedBy || 'anonymous',
      isBefore: isBefore ?? true,
    };
  } catch (err) {
    console.error(`  ⚠️  Failed to upload local image ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Transform a legacy issue's photos array:
 *  - Local /uploads/ URLs → upload file to Cloudinary
 *  - Unsplash/sample URLs → keep as-is (external, no public_id)
 *  - blob: URLs → mark as lost
 */
async function transformPhotos(photos) {
  const result = [];
  for (const photo of photos || []) {
    const localPath = resolveLocalFilePath(photo.url);
    if (localPath) {
      const uploaded = await uploadLocalImageToCloudinary(localPath, photo);
      if (uploaded) result.push(uploaded);
      else result.push({ ...photo, url: null, note: 'upload_failed' });
      continue;
    }
    if (typeof photo.url === 'string' && photo.url.startsWith('blob:')) {
      result.push({ ...photo, url: null, thumbnailUrl: null, note: 'blob_data_lost' });
      continue;
    }
    // External URL (e.g. Unsplash) — keep as-is
    result.push(photo);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Main migration
// ---------------------------------------------------------------------------

async function main() {
  console.log('========================================');
  console.log(' CityPulse Migration: db.json → Supabase + Cloudinary');
  console.log('========================================\n');

  // 1. Verify db.json exists
  if (!fs.existsSync(DB_JSON_PATH)) {
    console.error(`❌ Could not find ${DB_JSON_PATH}`);
    process.exit(1);
  }

  // 2. Read legacy database
  let db;
  try {
    db = JSON.parse(fs.readFileSync(DB_JSON_PATH, 'utf-8'));
  } catch (err) {
    console.error('❌ Failed to parse db.json:', err.message);
    process.exit(1);
  }

  const { issues = [], verifications = {}, localities = [], timeline = {} } = db;
  console.log(`📦 Loaded from db.json:`);
  console.log(`   Issues: ${issues.length}`);
  console.log(`   Verifications: ${Object.keys(verifications).length}`);
  console.log(`   Localities: ${localities.length}`);
  console.log(`   Timeline entries: ${Object.keys(timeline).length}\n`);

  // 3. Verify Supabase connectivity
  console.log('🔌 Checking Supabase connectivity...');
  try {
    const { error } = await supabase.from('issues').select('id').limit(1);
    if (error) throw error;
    console.log('   ✅ Supabase reachable\n');
  } catch (err) {
    console.error('   ❌ Supabase connectivity check failed:', err.message);
    console.error('   Make sure the schema has been applied (run db/schema.sql first).');
    process.exit(1);
  }

  // 4. Truncate all four tables (idempotent re-run safety)
  console.log('🧹 Truncating target tables...');
  for (const table of ['timeline_events', 'verifications', 'issues', 'localities']) {
    const { error } = await supabase.from(table).delete().neq('id', table === 'localities' ? '' : '__never__');
    if (error && !error.message.includes('Could not find')) {
      console.warn(`   ⚠️  Truncate ${table} warning (may be empty):`, error.message);
    } else {
      console.log(`   ✅ ${table} truncated`);
    }
  }

  const report = {
    issues: { inserted: 0, errors: 0 },
    verifications: { inserted: 0, errors: 0 },
    localities: { inserted: 0, errors: 0 },
    timeline: { inserted: 0, errors: 0 },
    photosUploaded: 0,
    photosFailed: 0,
    photosLost: 0,
  };

  // 5. Migrate localities first (FK-free but referenced by name only)
  console.log('\n📍 Migrating localities...');
  for (const loc of localities) {
    const { error } = await supabase.from('localities').insert({
      id: loc.id,
      name: loc.name,
      city: loc.city,
      bounds: loc.bounds || {},
      center: loc.center || {},
    });
    if (error) {
      console.error(`  ❌ Failed to insert locality ${loc.id}:`, error.message);
      report.localities.errors++;
    } else {
      report.localities.inserted++;
    }
  }
  console.log(`   ✅ ${report.localities.inserted} inserted, ${report.localities.errors} errors`);

  // 6. Migrate issues (including photo transformation)
  console.log('\n📋 Migrating issues...');
  for (const issue of issues) {
    const { photos = [] } = issue;
    const transformedPhotos = await transformPhotos(photos);
    for (const p of transformedPhotos) {
      if (p.public_id) report.photosUploaded++;
      else if (p.note === 'blob_data_lost') report.photosLost++;
      else if (p.note === 'upload_failed' || p.url === null) report.photosFailed++;
    }

    const { error } = await supabase.from('issues').insert({
      id: issue.id,
      title: issue.title,
      description: issue.description || '',
      category: issue.category,
      severity: issue.severity,
      status: issue.status || 'reported',
      location: issue.location || { lat: 0, lng: 0 },
      address: issue.address || '',
      locality_id: issue.localityId || 'custom-locality',
      photos: transformedPhotos,
      reported_by: issue.reportedBy || null,
      reported_at: issue.reportedAt || new Date().toISOString(),
      resolved_at: issue.resolvedAt || null,
      updated_at: issue.updatedAt || new Date().toISOString(),
      verification: issue.verification || null,
      timeline: issue.timeline || null,
      duplicate_group_id: issue.duplicateGroupId || null,
      duplicate_of: issue.duplicateOf || null,
    });
    if (error) {
      console.error(`  ❌ Failed to insert issue ${issue.id}:`, error.message);
      report.issues.errors++;
    } else {
      report.issues.inserted++;
    }
  }
  console.log(`   ✅ ${report.issues.inserted} inserted, ${report.issues.errors} errors`);
  console.log(`   🖼️  Cloudinary: ${report.photosUploaded} uploaded, ${report.photosFailed} failed, ${report.photosLost} blob-lost`);

  // 7. Migrate verifications
  console.log('\n✅ Migrating verifications...');
  for (const [issueId, stats] of Object.entries(verifications)) {
    const { error } = await supabase.from('verifications').insert({
      issue_id: issueId,
      confirms_existing: stats.confirmsExisting || 0,
      marks_fixed: stats.marksFixed || 0,
      community_photos: stats.communityPhotos || [],
      updates: stats.updates || [],
      last_verified_at: stats.lastVerifiedAt || new Date().toISOString(),
    });
    if (error) {
      // FK violation means the issue doesn't exist in Supabase — skip silently
      if (error.code === '23503') {
        console.warn(`  ⚠️  Skipped verification for missing issue ${issueId}`);
      } else {
        console.error(`  ❌ Failed to insert verification for ${issueId}:`, error.message);
        report.verifications.errors++;
      }
    } else {
      report.verifications.inserted++;
    }
  }
  console.log(`   ✅ ${report.verifications.inserted} inserted, ${report.verifications.errors} errors`);

  // 8. Migrate timeline events
  console.log('\n📜 Migrating timeline events...');
  for (const [issueId, events] of Object.entries(timeline)) {
    for (const event of events || []) {
      const { error } = await supabase.from('timeline_events').insert({
        id: event.id,
        issue_id: issueId,
        type: event.type,
        timestamp: event.timestamp || new Date().toISOString(),
        user_data: event.user || { id: 'anonymous', name: 'Anonymous' },
        photo: event.photo || null,
        status: event.status || null,
        notes: event.notes || '',
        metadata: event.metadata || {},
      });
      if (error) {
        if (error.code === '23503') {
          console.warn(`  ⚠️  Skipped timeline for missing issue ${issueId}`);
        } else {
          console.error(`  ❌ Failed to insert timeline event ${event.id}:`, error.message);
          report.timeline.errors++;
        }
      } else {
        report.timeline.inserted++;
      }
    }
  }
  console.log(`   ✅ ${report.timeline.inserted} inserted, ${report.timeline.errors} errors`);

  // 9. Final report
  console.log('\n========================================');
  console.log(' Migration Complete');
  console.log('========================================');
  console.log(` Issues:        ${report.issues.inserted} inserted, ${report.issues.errors} errors`);
  console.log(` Verifications: ${report.verifications.inserted} inserted, ${report.verifications.errors} errors`);
  console.log(` Localities:    ${report.localities.inserted} inserted, ${report.localities.errors} errors`);
  console.log(` Timeline:      ${report.timeline.inserted} inserted, ${report.timeline.errors} errors`);
  console.log(` Photos:        ${report.photosUploaded} uploaded to Cloudinary`);
  console.log(`                ${report.photosFailed} upload failures`);
  console.log(`                ${report.photosLost} blob URLs (data lost, skipped)`);

  if (report.issues.errors || report.verifications.errors || report.localities.errors || report.timeline.errors) {
    console.log('\n⚠️  Some rows failed to migrate. Check the logs above.');
    process.exitCode = 1;
  } else {
    console.log('\n🎉 All data migrated successfully!');
  }
}

// Run
main().catch((err) => {
  console.error('\n❌ Migration failed with unexpected error:', err.message);
  process.exit(1);
});