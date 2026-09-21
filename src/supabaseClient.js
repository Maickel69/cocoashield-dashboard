import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ntpqlywerhujuusebbmo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50cHFseXdlcmh1anV1c2ViYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMzI2MTIsImV4cCI6MjEwNDkwODYxMn0.XcaPOesMk4_Hmyn9lD7WObSwCXSUIdugwods62aCXVA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Solo este email puede acceder al dashboard
export const ALLOWED_DASHBOARD_EMAILS = [
  "8040182@unamad.edu.pe"
];

export const isEmailAllowed = (email) =>
  ALLOWED_DASHBOARD_EMAILS.includes(email?.toLowerCase().trim());
