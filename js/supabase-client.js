/* ============================================================
   CamionRecrute.com — Supabase client bootstrap
   ------------------------------------------------------------
   Requires the Supabase UMD bundle loaded before this file:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ============================================================ */

(function () {
  var cfg = window.CR_CONFIG || {};
  window.CR = window.CR || {};

  function isConfigured() {
    return (
      cfg.SUPABASE_URL &&
      cfg.SUPABASE_ANON_KEY &&
      cfg.SUPABASE_URL.indexOf("YOUR-PROJECT") === -1 &&
      cfg.SUPABASE_ANON_KEY.indexOf("YOUR-ANON") === -1
    );
  }

  window.CR.supabaseReady = false;

  if (typeof window.supabase === "undefined") {
    console.warn("[CamionRecrute] Supabase JS library not loaded.");
    return;
  }

  if (!isConfigured()) {
    console.warn(
      "[CamionRecrute] Supabase not configured yet. Edit js/config.js with your project URL and anon key."
    );
    return;
  }

  window.CR.supabase = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY
  );
  window.CR.supabaseReady = true;
})();
