/* ============================================================
   CamionRecrute.com — schema-driven bilingual form renderer
   ------------------------------------------------------------
   Define a schema (see driver-form / company-form) then call:
       CRForm.render(schemaObject);
   Handles FR/EN, checkbox/radio groups, progress bar,
   validation and submission to Supabase.
   ============================================================ */

window.CRForm = (function () {
  var L = function () { return window.CR.getLang(); };
  function tx(obj) { if (obj == null) return ""; return typeof obj === "string" ? obj : (obj[L()] || obj.fr || ""); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  var current = null;

  function field(f) {
    var id = "f_" + f.name + Math.random().toString(36).slice(2, 6);
    var req = f.required ? ' <span class="req">*</span>' : "";
    var label = '<label data-label>' + esc(tx(f.label)) + req + "</label>";
    var html = "";

    if (f.type === "select") {
      var opts = (f.options || []).map(function (o) {
        return '<option value="' + esc(o.value != null ? o.value : tx(o.label)) + '" data-opt>' + esc(tx(o.label)) + "</option>";
      }).join("");
      html = "<select name='" + f.name + "'" + (f.required ? " required" : "") + ">" + opts + "</select>";
    } else if (f.type === "textarea") {
      html = "<textarea name='" + f.name + "'" + (f.required ? " required" : "") + " data-ph placeholder='" + esc(tx(f.placeholder)) + "'></textarea>";
    } else if (f.type === "checkboxes" || f.type === "radios") {
      var input = f.type === "checkboxes" ? "checkbox" : "radio";
      var items = (f.options || []).map(function (o, i) {
        var oid = id + "_" + i;
        var val = o.value != null ? o.value : tx(o.label);
        return '<label class="choice" for="' + oid + '"><input type="' + input + '" id="' + oid + '" name="' + f.name + '" value="' + esc(val) + '"/><span data-opt>' + esc(tx(o.label)) + "</span></label>";
      }).join("");
      html = '<div class="choices ' + (f.type === "radios" ? "row" : "") + '">' + items + "</div>";
    } else {
      var t = f.type || "text";
      html = "<input type='" + t + "' name='" + f.name + "'" + (f.required ? " required" : "") + " data-ph placeholder='" + esc(tx(f.placeholder)) + "'/>";
    }

    return '<div class="field ' + (f.col === "full" ? "full" : "") + '" data-field="' + f.name + '" data-type="' + (f.type || "text") + '">' + label + html + "</div>";
  }

  function section(s) {
    var fields = s.fields.map(field).join("");
    return (
      '<div class="section-card reveal in">' +
      '<div class="section-header"><div class="section-num">' + s.num + "</div>" +
      '<div><div class="section-title" data-stitle>' + esc(tx(s.title)) + "</div>" +
      '<div class="section-sub" data-ssub>' + esc(tx(s.sub)) + "</div></div></div>" +
      '<div class="fields-grid">' + fields + "</div></div>"
    );
  }

  function collect(form, schema) {
    var values = {};
    schema.sections.forEach(function (s) {
      s.fields.forEach(function (f) {
        if (f.type === "checkboxes") {
          var checked = Array.prototype.slice.call(form.querySelectorAll("input[name='" + f.name + "']:checked")).map(function (i) { return i.value; });
          values[f.name] = checked;
        } else if (f.type === "radios") {
          var r = form.querySelector("input[name='" + f.name + "']:checked");
          values[f.name] = r ? r.value : null;
        } else {
          var el = form.querySelector("[name='" + f.name + "']");
          values[f.name] = el && el.value ? el.value : null;
        }
      });
    });
    return values;
  }

  function render(schema) {
    current = schema;
    var root = document.getElementById("crform-root");
    var html =
      '<div class="section-cards">' +
      schema.sections.map(section).join("") +
      "</div>" +
      '<div class="submit-section">' +
      '<button type="submit" class="btn" id="crSubmit" style="width:100%"><span data-submit>' + esc(tx(schema.submit)) + "</span></button>" +
      '<div class="form-msg" id="crMsg"></div>' +
      '<p class="form-note" data-note>' + esc(tx(schema.note)) + "</p></div>";

    var form = document.createElement("form");
    form.id = "crForm";
    form.setAttribute("novalidate", "");
    form.innerHTML = html;
    root.innerHTML = "";
    root.appendChild(form);

    // hero + chrome text
    setText("[data-form-title]", schema.title);
    setText("[data-form-intro]", schema.intro);

    wireProgress(form, schema);
    wireSubmit(form, schema);
    relabel(); // ensure correct language for dynamic option text
  }

  function setText(sel, val) {
    var el = document.querySelector(sel);
    if (el) el.innerHTML = tx(val);
  }

  // re-translate everything when language toggles
  function relabel() {
    if (!current) return;
    var form = document.getElementById("crForm");
    if (!form) return;
    setText("[data-form-title]", current.title);
    setText("[data-form-intro]", current.intro);

    var sIdx = 0;
    current.sections.forEach(function (s) {
      var cards = form.querySelectorAll(".section-card");
      var card = cards[sIdx++];
      if (!card) return;
      var st = card.querySelector("[data-stitle]"); if (st) st.textContent = tx(s.title);
      var ss = card.querySelector("[data-ssub]"); if (ss) ss.textContent = tx(s.sub);
      s.fields.forEach(function (f) {
        var wrap = card.querySelector("[data-field='" + f.name + "']");
        if (!wrap) return;
        var lab = wrap.querySelector("[data-label]");
        if (lab) lab.innerHTML = esc(tx(f.label)) + (f.required ? ' <span class="req">*</span>' : "");
        var ph = wrap.querySelector("[data-ph]");
        if (ph) ph.setAttribute("placeholder", tx(f.placeholder));
        if (f.options) {
          var optEls = wrap.querySelectorAll("[data-opt]");
          f.options.forEach(function (o, i) { if (optEls[i]) optEls[i].textContent = tx(o.label); });
        }
      });
    });
    var sub = form.querySelector("[data-submit]"); if (sub) sub.textContent = tx(current.submit);
    var note = form.querySelector("[data-note]"); if (note) note.textContent = tx(current.note);
  }

  function wireProgress(form, schema) {
    var fill = document.getElementById("progressFill");
    var text = document.getElementById("progressText");
    if (!fill) return;
    var total = schema.sections.length;
    window.addEventListener("scroll", function () {
      var docH = document.body.scrollHeight - window.innerHeight;
      var p = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      fill.style.width = Math.min(100, Math.max(0, p)) + "%";
      var sec = Math.min(total, Math.max(1, Math.ceil((p / 100) * total)));
      if (text) text.textContent = (L() === "en" ? "SECTION " : "SECTION ") + sec + " / " + total;
    });
  }

  function wireSubmit(form, schema) {
    var btn = form.querySelector("#crSubmit");
    var msg = form.querySelector("#crMsg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.className = "form-msg";
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var values = collect(form, schema);
      var payload = schema.buildPayload(values, L());

      btn.disabled = true;
      var span = btn.querySelector("[data-submit]");
      var orig = span.textContent;
      span.textContent = window.CR.t("lead.sending");

      doInsert(schema.table, payload)
        .then(function () {
          form.reset();
          msg.className = "form-msg ok";
          msg.textContent = window.CR.t("lead.success");
          window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch(function (err) {
          console.error(err);
          msg.className = "form-msg err";
          msg.textContent = window.CR.t("lead.error");
        })
        .finally(function () {
          btn.disabled = false;
          span.textContent = orig;
        });
    });
  }

  function doInsert(table, payload) {
    if (window.CR.supabaseReady && window.CR.supabase) {
      return window.CR.supabase.from(table).insert(payload).then(function (res) {
        if (res.error) throw res.error;
        return res;
      });
    }
    return Promise.reject(new Error("Supabase not configured (js/config.js)."));
  }

  return { render: render, relabel: relabel };
})();
