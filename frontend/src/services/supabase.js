import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://izoeumbeoegmvxyichko.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_y7V-pYwbyEp9PiTGMTosMg_nNx0fYvx';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
