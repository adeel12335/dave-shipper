/* ============================================================
   CamionRecrute.com — landing page behaviour
   loader · language · scroll reveal · contact info · lead form
   ============================================================ */

(function () {
  // ---- language ----
  if (window.CR && window.CR.applyLang) window.CR.applyLang(window.CR.getLang());

  // ---- contact info from config ----
  document.addEventListener("DOMContentLoaded", function () {
    var cfg = window.CR_CONFIG || {};
    var phoneEl = document.getElementById("footPhone");
    var emailEl = document.getElementById("footEmail");
    if (phoneEl && cfg.CONTACT_PHONE) {
      phoneEl.textContent = cfg.CONTACT_PHONE;
      phoneEl.href = "tel:" + cfg.CONTACT_PHONE.replace(/[^\d+]/g, "");
    }
    if (emailEl && cfg.CONTACT_EMAIL) {
      emailEl.textContent = cfg.CONTACT_EMAIL;
      emailEl.href = "mailto:" + cfg.CONTACT_EMAIL;
    }
    var yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();

    initReveal();
    initLeadForm();
    initMobileMenu();
  });

  // ---- loader hide ----
  window.addEventListener("load", function () {
    var loader = document.getElementById("cr-loader");
    if (loader) setTimeout(function () { loader.classList.add("hide"); }, 450);
  });

  // ---- scroll reveal ----
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  // ---- mobile menu ----
  function initMobileMenu() {
    var toggle = document.getElementById("menuToggle");
    var menu = document.getElementById("mobileMenu");
    var overlay = document.getElementById("mobileOverlay");
    var close = document.getElementById("menuClose");
    if (!toggle || !menu) return;

    function open() { menu.classList.add("open"); document.body.style.overflow = "hidden"; }
    function shut() { menu.classList.remove("open"); document.body.style.overflow = ""; }

    toggle.addEventListener("click", open);
    if (close) close.addEventListener("click", shut);
    if (overlay) overlay.addEventListener("click", shut);
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", shut); });
  }

  // ---- company lead form -> Supabase ----
  function initLeadForm() {
    var form = document.getElementById("leadForm");
    if (!form) return;
    var msg = document.getElementById("leadMsg");
    var btn = document.getElementById("leadSubmit");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.className = "form-msg";
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var fd = new FormData(form);
      var payload = {
        company_name: fd.get("company_name"),
        contact_name: fd.get("contact_name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        region: fd.get("region") || null,
        position_type: fd.get("position_type") || null,
        drivers_count: fd.get("drivers_count") || null,
        message: fd.get("message") || null,
        locale: window.CR.getLang(),
      };

      btn.disabled = true;
      var orig = btn.querySelector("span").textContent;
      btn.querySelector("span").textContent = window.CR.t("lead.sending");

      submit(payload)
        .then(function () {
          form.reset();
          msg.className = "form-msg ok";
          msg.textContent = window.CR.t("lead.success");
        })
        .catch(function (err) {
          console.error(err);
          msg.className = "form-msg err";
          msg.textContent = window.CR.t("lead.error");
        })
        .finally(function () {
          btn.disabled = false;
          btn.querySelector("span").textContent = orig;
        });
    });

    function submit(payload) {
      if (window.CR.supabaseReady && window.CR.supabase) {
        return window.CR.supabase
          .from("company_leads")
          .insert(payload)
          .then(function (res) {
            if (res.error) throw res.error;
            return res;
          });
      }
      // Not configured yet — don't lose the lead silently.
      return Promise.reject(new Error("Supabase not configured (js/config.js)."));
    }
  }
})();
