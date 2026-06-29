import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://umijqpjgnbivxmrhwmc.supabase.co';

const SUPABASE_ANON_KEY = 'ISI_PUBLISHABLE_KEY_KAMU_DI_SINI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);