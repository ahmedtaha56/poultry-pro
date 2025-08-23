import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bprdfdroaybigmecfsqc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcmRmZHJvYXliaWdtZWNmc3FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODA0NDcsImV4cCI6MjA2ODI1NjQ0N30.uotYgkfsSrLDlTO4UmJMJWv7ZRhQV3glrkNk3oVFu3E';
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    }
});