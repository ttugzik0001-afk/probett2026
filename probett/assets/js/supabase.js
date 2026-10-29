/* ============================================================
   GLOBAL SUPABASE SDK CONNECTION PIPELINE
   ============================================================ */

const SUPABASE_URL = "https://fmvijbaahcnlqvitucsy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtdmlqYmFhaGNubHF2aXR1Y3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDIxMDUsImV4cCI6MjEwODYxODEwNX0.teqSxsogeLkkmwSWOudIzIY44JUTyC-BzfB-1g89gg0";

if (window.supabase && typeof window.supabase.createClient === 'function') {
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Expose under the names the rest of the codebase looks for.
  // Do NOT overwrite window.supabase — that's the SDK itself.
  window.supabaseInstance = client;
  window.supabaseClient   = client;

  console.log("Supabase secure link handshake established successfully.");
} else {
  console.error("Critical Error: Supabase external core CDN script failed to load into window scope.");
}