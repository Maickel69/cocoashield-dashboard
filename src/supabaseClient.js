import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://ntpqlywerhujuusebbmo.supabase.co";
const SUPABASE_KEY  = "sb_publishable_0Xaf3ui3m1BVbWqwawysQA_I35-iiHM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Emails autorizados para acceder al dashboard
export const ALLOWED_DASHBOARD_EMAILS = [
  "8040182@unamad.edu.pe"
];

export const isEmailAllowed = (email) =>
  ALLOWED_DASHBOARD_EMAILS.includes(email?.toLowerCase().trim());
