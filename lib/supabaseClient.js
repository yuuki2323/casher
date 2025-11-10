import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://orghrnehbwbpvbmwktqy.supabase.co"; // あなたのSupabase URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZ2hybmVoYndicHZibXdrdHF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3Nzk0OTQsImV4cCI6MjA3ODM1NTQ5NH0.8yPYnzK5hFRBssXFi-_Xl5EdVhdT9GxKk0Am-yZFkNg";           // anon key
export const supabase = createClient(supabaseUrl, supabaseKey);
