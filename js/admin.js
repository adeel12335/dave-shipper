/* ============================================================
   CamionRecrute — Admin Panel Logic
   ============================================================ */

(function () {
  var cfg = window.CR_CONFIG || {};
  var sb = null;
  var currentUser = null;
  var currentPage = "dashboard";
  var currentModal = { table: null, id: null };
  var PAGE_SIZE = 20;

  var statusLabels = {
    new: "New",
    contacted: "Contacted",
    form_sent: "Form Sent",
    matched: "Matched",
    invoiced: "Invoiced",
    closed: "Closed",
  };
  var allStatuses = Object.keys(statusLabels);

  // ---- init ----
  document.addEventListener("DOMContentLoaded", function () {
    initSupabase();
    checkSession();
    wireLogin();
    wireNav();
    wireModal();
    wireSearch();
    wireResponsive();
  });

  function initSupabase() {
    if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf("YOUR-PROJECT") !== -1) {
      console.warn("Supabase not configured");
      return;
    }
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  }

  // ---- auth ----
  function checkSession() {
    if (!sb) return;
    sb.auth.getSession().then(function (r) {
      if (r.data.session) {
        currentUser = r.data.session.user;
        showApp();
      }
    });
  }

  function wireLogin() {
    var form = document.getElementById("loginForm");
    var err = document.getElementById("loginError");
    var btn = document.getElementById("loginBtn");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      err.classList.remove("show");
      if (!sb) {
        err.textContent = "Supabase not configured. Edit js/config.js";
        err.classList.add("show");
        return;
      }
      var email = document.getElementById("loginEmail").value;
      var pass = document.getElementById("loginPass").value;
      btn.disabled = true;
      btn.textContent = "Signing in...";

      sb.auth.signInWithPassword({ email: email, password: pass }).then(function (r) {
        if (r.error) {
          err.textContent = r.error.message;
          err.classList.add("show");
          btn.disabled = false;
          btn.textContent = "Sign In";
          return;
        }
        currentUser = r.data.user;
        showApp();
      });
    });
  }

  function showApp() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("adminApp").classList.add("active");

    var email = currentUser.email || "admin";
    document.getElementById("userEmail").textContent = email;
    document.getElementById("userAvatar").textContent = email.charAt(0).toUpperCase();

    var url = document.getElementById("settingSupaUrl");
    var key = document.getElementById("settingSupaKey");
    var status = document.getElementById("supabaseStatus");
    if (url) url.value = cfg.SUPABASE_URL || "";
    if (key) key.value = cfg.SUPABASE_ANON_KEY ? cfg.SUPABASE_ANON_KEY.substring(0, 20) + "..." : "";
    if (status) {
      status.className = "settings-status connected";
      status.textContent = "Connected";
    }

    loadDashboard();
    loadLeads();
    loadDrivers();
    loadCompanies();

    document.getElementById("logoutBtn").addEventListener("click", function () {
      sb.auth.signOut().then(function () { location.reload(); });
    });
  }

  // ---- navigation ----
  function wireNav() {
    var items = document.querySelectorAll("[data-page]");
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        navigate(item.getAttribute("data-page"));
      });
    });
  }

  function navigate(page) {
    currentPage = page;
    document.querySelectorAll("[data-page]").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-page") === page);
    });
    document.querySelectorAll(".page-view").forEach(function (el) {
      el.classList.toggle("active", el.id === "page-" + page);
    });
    var titles = { dashboard: "Dashboard", leads: "Company Leads", drivers: "Driver Applications", companies: "Company Applications", settings: "Settings" };
    document.getElementById("pageTitle").textContent = titles[page] || page;

    var sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("open");
  }

  // ---- search ----
  function wireSearch() {
    var input = document.getElementById("globalSearch");
    var timer = null;
    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var q = input.value.trim().toLowerCase();
        filterTables(q);
      }, 300);
    });
  }

  function filterTables(q) {
    ["leadsTable", "driversTable", "companiesTable"].forEach(function (tid) {
      var rows = document.querySelectorAll("#" + tid + " tr");
      rows.forEach(function (row) {
        if (!q) { row.style.display = ""; return; }
        row.style.display = row.textContent.toLowerCase().indexOf(q) !== -1 ? "" : "none";
      });
    });
  }

  // ---- responsive ----
  function wireResponsive() {
    var toggle = document.getElementById("sidebarToggle");
    var sidebar = document.getElementById("sidebar");
    function checkWidth() {
      if (window.innerWidth <= 768) {
        toggle.style.display = "flex";
      } else {
        toggle.style.display = "none";
        sidebar.classList.remove("open");
      }
    }
    toggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });
    window.addEventListener("resize", checkWidth);
    checkWidth();
  }

  // ---- dashboard ----
  function loadDashboard() {
    if (!sb) return;
    Promise.all([
      sb.from("company_leads").select("id,status,company_name,created_at", { count: "exact", head: false }).order("created_at", { ascending: false }).limit(10),
      sb.from("driver_applications").select("id,status,full_name,created_at", { count: "exact", head: false }).order("created_at", { ascending: false }).limit(10),
      sb.from("company_applications").select("id,status,company_name,created_at", { count: "exact", head: false }).order("created_at", { ascending: false }).limit(10),
    ]).then(function (results) {
      var leads = results[0];
      var drivers = results[1];
      var companies = results[2];

      var lCount = leads.count || (leads.data ? leads.data.length : 0);
      var dCount = drivers.count || (drivers.data ? drivers.data.length : 0);
      var cCount = companies.count || (companies.data ? companies.data.length : 0);

      document.getElementById("statLeads").textContent = lCount;
      document.getElementById("statDrivers").textContent = dCount;
      document.getElementById("statCompanies").textContent = cCount;
      document.getElementById("leadsCount").textContent = lCount;
      document.getElementById("driversCount").textContent = dCount;
      document.getElementById("companiesCount").textContent = cCount;

      var newCount = 0;
      [leads, drivers, companies].forEach(function (r) {
        if (r.data) r.data.forEach(function (row) { if (row.status === "new") newCount++; });
      });
      document.getElementById("statNew").textContent = newCount;

      // recent activity
      var all = [];
      if (leads.data) leads.data.forEach(function (r) { all.push({ type: "Lead", name: r.company_name, status: r.status, date: r.created_at }); });
      if (drivers.data) drivers.data.forEach(function (r) { all.push({ type: "Driver", name: r.full_name, status: r.status, date: r.created_at }); });
      if (companies.data) companies.data.forEach(function (r) { all.push({ type: "Company", name: r.company_name, status: r.status, date: r.created_at }); });
      all.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

      var tbody = document.getElementById("recentTable");
      if (!all.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="table-empty">No entries yet</td></tr>';
        return;
      }
      tbody.innerHTML = all.slice(0, 15).map(function (r) {
        return "<tr><td>" + esc(r.type) + "</td><td><strong>" + esc(r.name || "-") + "</strong></td><td>" + statusBadge(r.status) + "</td><td>" + formatDate(r.date) + "</td></tr>";
      }).join("");
    });
  }

  // ---- leads ----
  var leadsData = [];
  var leadsFilter = "all";
  var leadsPage = 0;

  function loadLeads() {
    if (!sb) return;
    sb.from("company_leads").select("*").order("created_at", { ascending: false }).then(function (r) {
      leadsData = r.data || [];
      renderLeadsFilters();
      renderLeads();
    });
  }

  function renderLeadsFilters() {
    var counts = { all: leadsData.length };
    allStatuses.forEach(function (s) { counts[s] = 0; });
    leadsData.forEach(function (r) { if (counts[r.status] !== undefined) counts[r.status]++; else counts[r.status] = 1; });

    var html = '<button class="filter-btn active" data-filter="all">All <span class="count">' + counts.all + "</span></button>";
    allStatuses.forEach(function (s) {
      if (counts[s]) html += '<button class="filter-btn" data-filter="' + s + '">' + statusLabels[s] + ' <span class="count">' + counts[s] + "</span></button>";
    });
    document.getElementById("leadsFilters").innerHTML = html;

    document.querySelectorAll("#leadsFilters .filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        leadsFilter = btn.getAttribute("data-filter");
        leadsPage = 0;
        document.querySelectorAll("#leadsFilters .filter-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        renderLeads();
      });
    });
  }

  function renderLeads() {
    var filtered = leadsFilter === "all" ? leadsData : leadsData.filter(function (r) { return r.status === leadsFilter; });
    var start = leadsPage * PAGE_SIZE;
    var page = filtered.slice(start, start + PAGE_SIZE);
    var tbody = document.getElementById("leadsTable");

    if (!page.length) {
      tbody.innerHTML = '<tr><td colspan="10" class="table-empty">No entries found</td></tr>';
    } else {
      tbody.innerHTML = page.map(function (r) {
        return "<tr>" +
          "<td><strong>" + esc(r.company_name) + "</strong></td>" +
          "<td>" + esc(r.contact_name) + "</td>" +
          "<td>" + esc(r.phone) + "</td>" +
          "<td>" + esc(r.region || "-") + "</td>" +
          "<td>" + esc(r.position_type || "-") + "</td>" +
          "<td>" + statusBadge(r.status) + "</td>" +
          "<td>" + syncBadge(r.synced_zoho) + "</td>" +
          "<td>" + syncBadge(r.synced_excel) + "</td>" +
          "<td>" + formatDate(r.created_at) + "</td>" +
          '<td><div class="row-actions"><button class="row-btn" onclick="AdminPanel.openDetail(\'company_leads\',\'' + r.id + '\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></div></td>' +
          "</tr>";
      }).join("");
    }

    document.getElementById("leadsInfo").textContent = "Showing " + (page.length ? start + 1 : 0) + "-" + (start + page.length) + " of " + filtered.length;
    renderPagination("leadsPagination", filtered.length, leadsPage, function (p) { leadsPage = p; renderLeads(); });
  }

  // ---- drivers ----
  var driversData = [];
  var driversFilter = "all";
  var driversPage = 0;

  function loadDrivers() {
    if (!sb) return;
    sb.from("driver_applications").select("*").order("created_at", { ascending: false }).then(function (r) {
      driversData = r.data || [];
      renderDriversFilters();
      renderDrivers();
    });
  }

  function renderDriversFilters() {
    var counts = { all: driversData.length };
    allStatuses.forEach(function (s) { counts[s] = 0; });
    driversData.forEach(function (r) { if (counts[r.status] !== undefined) counts[r.status]++; });

    var html = '<button class="filter-btn active" data-filter="all">All <span class="count">' + counts.all + "</span></button>";
    allStatuses.forEach(function (s) {
      if (counts[s]) html += '<button class="filter-btn" data-filter="' + s + '">' + statusLabels[s] + ' <span class="count">' + counts[s] + "</span></button>";
    });
    document.getElementById("driversFilters").innerHTML = html;

    document.querySelectorAll("#driversFilters .filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        driversFilter = btn.getAttribute("data-filter");
        driversPage = 0;
        document.querySelectorAll("#driversFilters .filter-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        renderDrivers();
      });
    });
  }

  function renderDrivers() {
    var filtered = driversFilter === "all" ? driversData : driversData.filter(function (r) { return r.status === driversFilter; });
    var start = driversPage * PAGE_SIZE;
    var page = filtered.slice(start, start + PAGE_SIZE);
    var tbody = document.getElementById("driversTable");

    if (!page.length) {
      tbody.innerHTML = '<tr><td colspan="10" class="table-empty">No entries found</td></tr>';
    } else {
      tbody.innerHTML = page.map(function (r) {
        var license = Array.isArray(r.license_classes) ? r.license_classes.join(", ") : (r.license_classes || "-");
        return "<tr>" +
          "<td><strong>" + esc(r.full_name) + "</strong></td>" +
          "<td>" + esc(r.phone) + "</td>" +
          "<td>" + esc(r.city || "-") + "</td>" +
          "<td>" + esc(license) + "</td>" +
          "<td>" + esc(r.years_experience || "-") + "</td>" +
          "<td>" + statusBadge(r.status) + "</td>" +
          "<td>" + syncBadge(r.synced_zoho) + "</td>" +
          "<td>" + syncBadge(r.synced_excel) + "</td>" +
          "<td>" + formatDate(r.created_at) + "</td>" +
          '<td><div class="row-actions"><button class="row-btn" onclick="AdminPanel.openDetail(\'driver_applications\',\'' + r.id + '\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></div></td>' +
          "</tr>";
      }).join("");
    }

    document.getElementById("driversInfo").textContent = "Showing " + (page.length ? start + 1 : 0) + "-" + (start + page.length) + " of " + filtered.length;
    renderPagination("driversPagination", filtered.length, driversPage, function (p) { driversPage = p; renderDrivers(); });
  }

  // ---- company applications ----
  var companiesData = [];
  var companiesFilter = "all";
  var companiesPage = 0;

  function loadCompanies() {
    if (!sb) return;
    sb.from("company_applications").select("*").order("created_at", { ascending: false }).then(function (r) {
      companiesData = r.data || [];
      renderCompaniesFilters();
      renderCompanies();
    });
  }

  function renderCompaniesFilters() {
    var counts = { all: companiesData.length };
    allStatuses.forEach(function (s) { counts[s] = 0; });
    companiesData.forEach(function (r) { if (counts[r.status] !== undefined) counts[r.status]++; });

    var html = '<button class="filter-btn active" data-filter="all">All <span class="count">' + counts.all + "</span></button>";
    allStatuses.forEach(function (s) {
      if (counts[s]) html += '<button class="filter-btn" data-filter="' + s + '">' + statusLabels[s] + ' <span class="count">' + counts[s] + "</span></button>";
    });
    document.getElementById("companiesFilters").innerHTML = html;

    document.querySelectorAll("#companiesFilters .filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        companiesFilter = btn.getAttribute("data-filter");
        companiesPage = 0;
        document.querySelectorAll("#companiesFilters .filter-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        renderCompanies();
      });
    });
  }

  function renderCompanies() {
    var filtered = companiesFilter === "all" ? companiesData : companiesData.filter(function (r) { return r.status === companiesFilter; });
    var start = companiesPage * PAGE_SIZE;
    var page = filtered.slice(start, start + PAGE_SIZE);
    var tbody = document.getElementById("companiesTable");

    if (!page.length) {
      tbody.innerHTML = '<tr><td colspan="10" class="table-empty">No entries found</td></tr>';
    } else {
      tbody.innerHTML = page.map(function (r) {
        return "<tr>" +
          "<td><strong>" + esc(r.company_name) + "</strong></td>" +
          "<td>" + esc(r.contact_name || "-") + "</td>" +
          "<td>" + esc(r.phone || "-") + "</td>" +
          "<td>" + esc(r.city_region || "-") + "</td>" +
          "<td>" + esc(r.drivers_count || "-") + "</td>" +
          "<td>" + statusBadge(r.status) + "</td>" +
          "<td>" + syncBadge(r.synced_zoho) + "</td>" +
          "<td>" + syncBadge(r.synced_excel) + "</td>" +
          "<td>" + formatDate(r.created_at) + "</td>" +
          '<td><div class="row-actions"><button class="row-btn" onclick="AdminPanel.openDetail(\'company_applications\',\'' + r.id + '\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></div></td>' +
          "</tr>";
      }).join("");
    }

    document.getElementById("companiesInfo").textContent = "Showing " + (page.length ? start + 1 : 0) + "-" + (start + page.length) + " of " + filtered.length;
    renderPagination("companiesPagination", filtered.length, companiesPage, function (p) { companiesPage = p; renderCompanies(); });
  }

  // ---- detail modal ----
  function wireModal() {
    document.getElementById("modalClose").addEventListener("click", closeModal);
    document.getElementById("modalCancel").addEventListener("click", closeModal);
    document.getElementById("modalSave").addEventListener("click", saveModal);
    document.getElementById("detailModal").addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });
  }

  function openDetail(table, id) {
    if (!sb) return;
    currentModal = { table: table, id: id };
    sb.from(table).select("*").eq("id", id).single().then(function (r) {
      if (r.error || !r.data) { toast("Entry not found", "error"); return; }
      renderModal(table, r.data);
      document.getElementById("detailModal").classList.add("open");
    });
  }

  function renderModal(table, row) {
    var title = table === "company_leads" ? "Lead: " + row.company_name :
                table === "driver_applications" ? "Driver: " + row.full_name :
                "Company: " + row.company_name;
    document.getElementById("modalTitle").textContent = title;

    var html = '<div class="modal-grid">';
    var skip = ["id", "admin_notes", "status", "synced_zoho", "synced_excel", "details"];

    Object.keys(row).forEach(function (key) {
      if (skip.indexOf(key) !== -1) return;
      var val = row[key];
      var display = "";
      if (val === null || val === undefined || val === "") {
        display = '<span class="empty">-</span>';
      } else if (Array.isArray(val)) {
        display = val.length ? '<div class="tags">' + val.map(function (v) { return '<span class="tag">' + esc(v) + '</span>'; }).join("") + '</div>' : '<span class="empty">-</span>';
      } else {
        display = esc(String(val));
      }
      html += '<div class="modal-field"><label>' + esc(formatLabel(key)) + '</label><div class="value">' + display + '</div></div>';
    });

    // details JSON (company_applications)
    if (row.details && typeof row.details === "object" && Object.keys(row.details).length) {
      html += '<div class="modal-field full"><label>Details (JSON)</label><div class="value"><pre style="font-size:12px;max-height:200px;overflow:auto;background:#f5f5f5;padding:10px;border-radius:6px">' + esc(JSON.stringify(row.details, null, 2)) + '</pre></div></div>';
    }

    html += '</div>';

    // status select
    html += '<hr style="margin:20px 0;border:none;border-top:1px solid #e2e6ed">';
    html += '<div class="modal-grid">';
    html += '<div class="modal-field"><label>Status</label><select id="modalStatus">';
    allStatuses.forEach(function (s) {
      html += '<option value="' + s + '"' + (row.status === s ? " selected" : "") + '>' + statusLabels[s] + '</option>';
    });
    html += '</select></div>';

    // sync toggles
    html += '<div class="modal-field"><label>Sync Status</label><div style="display:flex;gap:12px;padding:8px 0">';
    html += '<label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer"><input type="checkbox" id="modalZoho"' + (row.synced_zoho ? " checked" : "") + ' style="accent-color:#d4a03c"> Zoho</label>';
    html += '<label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer"><input type="checkbox" id="modalExcel"' + (row.synced_excel ? " checked" : "") + ' style="accent-color:#d4a03c"> Excel</label>';
    html += '</div></div>';

    // admin notes
    html += '<div class="modal-field full"><label>Admin Notes</label><textarea id="modalNotes" placeholder="Add notes about this entry...">' + esc(row.admin_notes || "") + '</textarea></div>';
    html += '</div>';

    document.getElementById("modalBody").innerHTML = html;
  }

  function saveModal() {
    if (!sb || !currentModal.table || !currentModal.id) return;

    var update = {
      status: document.getElementById("modalStatus").value,
      admin_notes: document.getElementById("modalNotes").value || null,
      synced_zoho: document.getElementById("modalZoho").checked,
      synced_excel: document.getElementById("modalExcel").checked,
    };

    sb.from(currentModal.table).update(update).eq("id", currentModal.id).then(function (r) {
      if (r.error) {
        toast("Error saving: " + r.error.message, "error");
        return;
      }
      toast("Entry updated successfully", "success");
      closeModal();
      loadDashboard();
      loadLeads();
      loadDrivers();
      loadCompanies();
    });
  }

  function closeModal() {
    document.getElementById("detailModal").classList.remove("open");
    currentModal = { table: null, id: null };
  }

  // ---- helpers ----
  function esc(s) {
    if (!s) return "";
    var el = document.createElement("span");
    el.textContent = s;
    return el.innerHTML;
  }

  function formatDate(d) {
    if (!d) return "-";
    var dt = new Date(d);
    var month = dt.toLocaleDateString("en-US", { month: "short" });
    return month + " " + dt.getDate() + ", " + dt.getFullYear();
  }

  function formatLabel(key) {
    return key.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function statusBadge(status) {
    var label = statusLabels[status] || status;
    return '<span class="badge badge-' + (status || "new") + '"><span class="badge-dot"></span>' + esc(label) + '</span>';
  }

  function syncBadge(synced) {
    if (synced) return '<span class="sync-badge synced">Synced</span>';
    return '<span class="sync-badge pending">Pending</span>';
  }

  function renderPagination(containerId, total, current, onPage) {
    var pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) { document.getElementById(containerId).innerHTML = ""; return; }
    var html = "";
    html += '<button class="page-btn"' + (current === 0 ? " disabled" : "") + ' data-p="' + (current - 1) + '">&lt;</button>';
    for (var i = 0; i < pages; i++) {
      if (pages > 7 && i > 1 && i < pages - 2 && Math.abs(i - current) > 1) {
        if (i === 2 || i === pages - 3) html += '<button class="page-btn" disabled>...</button>';
        continue;
      }
      html += '<button class="page-btn' + (i === current ? " active" : "") + '" data-p="' + i + '">' + (i + 1) + '</button>';
    }
    html += '<button class="page-btn"' + (current >= pages - 1 ? " disabled" : "") + ' data-p="' + (current + 1) + '">&gt;</button>';

    var container = document.getElementById(containerId);
    container.innerHTML = html;
    container.querySelectorAll(".page-btn:not([disabled])").forEach(function (btn) {
      btn.addEventListener("click", function () {
        onPage(parseInt(btn.getAttribute("data-p"), 10));
      });
    });
  }

  function toast(msg, type) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.className = "toast " + (type || "success") + " show";
    setTimeout(function () { el.classList.remove("show"); }, 3000);
  }

  // expose for onclick
  window.AdminPanel = { openDetail: openDetail };
})();
