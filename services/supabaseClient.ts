import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

// Initialize the Supabase client
// This is ready to be used if the user adds actual database tables.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);