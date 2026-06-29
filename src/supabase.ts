import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://umijqpjgnbivxmrhwmc.supabase.co';

const SUPABASE_ANON_KEY = 'sb_publishable_GEuxMQj9prLsGCqIoJUimA_XeCrD9YU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);