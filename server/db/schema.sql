-- ============================================
-- CityPulse Database Schema for Supabase (PostgreSQL)
-- Run this in the Supabase SQL Editor or via psql.
-- ============================================

-- 1. ISSUES TABLE
-- Stores all issue records. Photos stored as JSONB array:
-- [{ id, url, thumbnailUrl, public_id, uploadedAt, uploadedBy, isBefore }]
CREATE TABLE IF NOT EXISTS public.issues (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'reported',
  location JSONB NOT NULL DEFAULT '{"lat": 0, "lng": 0}',
  address TEXT NOT NULL DEFAULT '',
  locality_id TEXT NOT NULL DEFAULT 'custom-locality',
  photos JSONB NOT NULL DEFAULT '[]',
  reported_by JSONB,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification JSONB,
  timeline JSONB,
  duplicate_group_id TEXT,
  duplicate_of TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast locality-based queries
CREATE INDEX IF NOT EXISTS idx_issues_locality_id ON public.issues (locality_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues (status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON public.issues (category);

-- ============================================
-- 2. VERIFICATIONS TABLE
-- One row per issue with community verification stats.
-- updates stored as JSONB array of community update objects.
CREATE TABLE IF NOT EXISTS public.verifications (
  id SERIAL PRIMARY KEY,
  issue_id TEXT NOT NULL UNIQUE REFERENCES public.issues(id) ON DELETE CASCADE,
  confirms_existing INTEGER NOT NULL DEFAULT 0,
  marks_fixed INTEGER NOT NULL DEFAULT 0,
  community_photos JSONB NOT NULL DEFAULT '[]',
  updates JSONB NOT NULL DEFAULT '[]',
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verifications_issue_id ON public.verifications (issue_id);

-- ============================================
-- 3. LOCALITIES TABLE
-- Static locality data (city, bounds, center).
CREATE TABLE IF NOT EXISTS public.localities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  bounds JSONB NOT NULL DEFAULT '{}',
  center JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. TIMELINE EVENTS TABLE
-- One row per timeline event, linked to an issue.
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id TEXT PRIMARY KEY,
  issue_id TEXT NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_data JSONB NOT NULL DEFAULT '{}',
  photo JSONB,
  status TEXT,
  notes TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_issue_id ON public.timeline_events (issue_id);
CREATE INDEX IF NOT EXISTS idx_timeline_timestamp ON public.timeline_events (timestamp DESC);

-- ============================================
-- Disable Row Level Security
-- The Express backend is the ONLY client (via service role key).
-- The frontend never talks to Supabase directly, so RLS is not needed.
-- ============================================
ALTER TABLE public.issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.localities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events DISABLE ROW LEVEL SECURITY;
