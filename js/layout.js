/* ============================================================
   CamionRecrute.com — shared layout: header, mobile menu, footer
   Auto-detects root vs subdirectory pages (forms/, pages/)
   ============================================================ */

(function () {
  var p = window.location.pathname;
  var inSub = p.indexOf("/forms/") !== -1 || p.indexOf("/pages/") !== -1;
  var B = inSub ? "../" : "";
  var PAGE = p.split("/").pop() || "";

  function active(name) {
    return PAGE.indexOf(name) !== -1 ? ' class="active"' : "";
  }

  var HEADER =
    '<header class="topbar">' +
    '<div class="wrap nav">' +
    '<a class="brand" href="' +
    B +
    'index.html">' +
    '<img src="' +
    B +
    'images/logo-removebg-preview.png" alt="CR" />' +
    '<div class="brand-text"><span class="brand-name">CAMION<span class="brand-gold">RECRUTE</span>.COM</span><span class="brand-tag">LES BONS CHAUFFEURS. LES BONNES OPPORTUNITÉS.</span></div>' +
    "</a>" +
    '<div class="nav-links">' +
    '<a href="' +
    B +
    'forms/driver-form.html"' +
    active("driver-form") +
    ' data-i18n="nav.driverForm">Formulaire Chauffeur</a>' +
    '<a href="' +
    B +
    'forms/company-form-fr.html"' +
    active("company-form") +
    ' data-i18n="nav.companyForm">Formulaire Entreprise</a>' +
    "</div>" +
    '<div class="nav-actions">' +
    '<button class="lang-btn" data-lang-toggle type="button" onclick="CR.toggleLang();if(window.CRForm)CRForm.relabel();">EN</button>' +
    '<a class="btn btn-sm" href="' +
    B +
    'index.html#apply" data-i18n="nav.apply">Postuler maintenant</a>' +
    '<button class="hamburger" id="menuToggle" aria-label="Menu">' +
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
    "</button>" +
    "</div>" +
    "</div>" +
    "</header>" +
    '<div class="mobile-menu" id="mobileMenu">' +
    '<div class="mobile-overlay" id="mobileOverlay"></div>' +
    '<div class="mobile-panel">' +
    '<button class="mobile-close" id="menuClose" aria-label="Close">' +
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    "</button>" +
    '<a href="' +
    B +
    'index.html#how" data-i18n="nav.drivers">Drivers</a>' +
    '<a href="' +
    B +
    'index.html#companies" data-i18n="nav.companies">Companies</a>' +
    '<a href="' +
    B +
    'forms/driver-form.html" data-i18n="nav.driverForm">Driver Form</a>' +
    '<a href="' +
    B +
    'forms/company-form-fr.html" data-i18n="nav.companyForm">Company Form</a>' +
    '<a href="' +
    B +
    'index.html#apply" class="mobile-cta" data-i18n="nav.apply">Apply now</a>' +
    "</div>" +
    "</div>";

  var FOOTER =
    '<footer class="footer">' +
    '<div class="wrap foot-grid">' +
    "<div>" +
    '<a class="brand" href="' +
    B +
    'index.html"><img src="' +
    B +
    'images/logo-removebg-preview.png" alt="CamionRecrute.com" /></a>' +
    '<p class="foot-tag" data-i18n="nav.tagline">LES BONS CHAUFFEURS. LES BONNES OPPORTUNITÉS.</p>' +
    "</div>" +
    "<div>" +
    '<div class="foot-label" data-i18n="foot.contact">CONTACT</div>' +
    '<div class="foot-row">' +
    '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
    '<a id="footPhone" href="tel:+15142654285">(514) 265-4285</a>' +
    "</div>" +
    '<div class="foot-row">' +
    '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>' +
    '<a id="footEmail" href="mailto:info@camionrecrute.com">info@camionrecrute.com</a>' +
    "</div>" +
    "</div>" +
    "<div>" +
    '<div class="foot-label" data-i18n="foot.follow">SUIVEZ-NOUS</div>' +
    '<div class="social">' +
    '<a href="#" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>' +
    '<a href="#" aria-label="LinkedIn"><svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.2 8h4.6v13H.2zM8 8h4.41v1.78h.06c.61-1.16 2.1-2.38 4.33-2.38 4.63 0 5.49 3.05 5.49 7.01V21h-4.6v-5.7c0-1.36-.02-3.1-1.89-3.1-1.89 0-2.18 1.48-2.18 3v5.8H8z"/></svg></a>' +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="copyright">© <span id="year">2026</span> CamionRecrute.com — <span data-i18n="foot.rights">Tous droits réservés.</span></div>' +
    "</footer>";

  function inject(id, html) {
    var el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }

  inject("site-header", HEADER);
  inject("site-footer", FOOTER);

  // Floating action buttons (scroll-top + apply CTA + language toggle) — every page
  var FABS =
    '<div class="fab-stack">' +
    '<button class="fab fab-top" id="scrollTopFab" type="button" aria-label="Haut de page / Back to top">' +
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>' +
    "</button>" +
    '<a class="fab fab-apply" href="' +
    B +
    'index.html#apply">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
    '<span data-i18n="nav.apply">Postuler maintenant</span></a>' +
    '<button class="fab fab-lang" id="langFab" type="button" aria-label="Changer de langue / Switch language">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
    '<span data-lang-toggle>EN</span>' +
    "</button>" +
    "</div>";
  document.body.insertAdjacentHTML("beforeend", FABS);

  function onReady(fn) {
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  onReady(function () {
    // Mobile menu
    var toggle = document.getElementById("menuToggle");
    var menu = document.getElementById("mobileMenu");
    var overlay = document.getElementById("mobileOverlay");
    var close = document.getElementById("menuClose");
    if (toggle && menu) {
      function open() {
        menu.classList.add("open");
        document.body.style.overflow = "hidden";
      }
      function shut() {
        menu.classList.remove("open");
        document.body.style.overflow = "";
      }
      toggle.addEventListener("click", open);
      if (close) close.addEventListener("click", shut);
      if (overlay) overlay.addEventListener("click", shut);
      menu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", shut);
      });
    }

    // Contact info from config
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

    // Copyright year
    var yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();

    // Floating language toggle
    var langFab = document.getElementById("langFab");
    if (langFab)
      langFab.addEventListener("click", function () {
        if (window.CR && window.CR.toggleLang) window.CR.toggleLang();
        if (window.CRForm && window.CRForm.relabel) window.CRForm.relabel();
      });

    // Scroll-to-top floating button (appears after scrolling down)
    var scrollTopFab = document.getElementById("scrollTopFab");
    if (scrollTopFab) {
      scrollTopFab.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      var toggleTopBtn = function () {
        if (window.scrollY > 400) scrollTopFab.classList.add("show");
        else scrollTopFab.classList.remove("show");
      };
      window.addEventListener("scroll", toggleTopBtn, { passive: true });
      toggleTopBtn();
    }

    // Apply i18n to injected header/footer
    if (window.CR && window.CR.applyLang)
      window.CR.applyLang(window.CR.getLang());
  });
})();
