// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zmgltakttajzqaopakxb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZ2x0YWt0dGFqenFhb3Bha3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MzcyODUsImV4cCI6MjA4MTAxMzI4NX0.3MQYeJ6tZwXcJ0KuWNst4JmJYfJleEMDTSd1hUQdlkU';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;