/* ============================================================
   CamionRecrute.com — landing page behaviour
   loader · scroll reveal · lead form submission
   (header/footer/mobile-menu/i18n handled by layout.js)
   ============================================================ */

(function () {
  // ---- loader hide ----
  window.addEventListener("load", function () {
    var loader = document.getElementById("cr-loader");
    if (loader)
      setTimeout(function () {
        loader.classList.add("hide");
      }, 450);
  });

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initLeadForm();
    initNavScroll();
  });

  // ---- nav scroll effect ----
  function initNavScroll() {
    var bar = document.querySelector(".topbar");
    if (!bar) return;
    function onScroll() {
      if (window.scrollY > 60) {
        bar.classList.add("scrolled");
      } else {
        bar.classList.remove("scrolled");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---- scroll reveal ----
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) {
        e.classList.add("in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach(function (e) {
      io.observe(e);
    });
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
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

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
      return Promise.reject(
        new Error("Supabase not configured (js/config.js)."),
      );
    }
  }
})();
