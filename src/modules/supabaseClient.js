import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://z0.10xyoutube.net';
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjY4NDg4MCwiZXhwIjo0OTI4MzU4NDgwLCJyb2xlIjoiYW5vbiJ9.c5_aBxItycm-AqpcW116St9YXK_NxHrcsDZr8rFkcsU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
