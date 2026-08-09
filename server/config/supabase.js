import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from the project root (one level up from server/)
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '..', '.env'), quiet: true });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
}

export const supabase = createClient(supabaseUrl || 'missing-url', supabaseKey || 'missing-key', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Ping the database to verify connectivity.
 * Returns true if reachable, false otherwise.
 */
export async function checkDatabaseConnection() {
  try {
    const { error } = await supabase.from('issues').select('id').limit(1);
    return !error;
  } catch (err) {
    console.error('[Supabase] Connection check failed:', err.message);
    return false;
  }
}