#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  try {
    const { data, error } = await supabase.storage.from('profile').list();
    if (error) {
      console.error('Storage list error:', error.message || error);
      process.exit(2);
    }
    console.log('Storage list OK, items:', data?.length ?? 0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(3);
  }
}

test();
