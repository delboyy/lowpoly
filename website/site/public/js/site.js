// Attribution: remember which post sent the visitor (UTM tags) for this visit,
// and copy it into hidden fields on the leak-check form.
var attr = (function () {
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
  var store = {};
  try { store = JSON.parse(sessionStorage.getItem("ss_attr") || "{}"); } catch (e) {}
  var q = new URLSearchParams(location.search);
  if (KEYS.some(function (k) { return q.get(k); })) {
    store = { landing_page: store.landing_page, referrer: store.referrer };
    KEYS.forEach(function (k) { if (q.get(k)) store[k] = q.get(k).slice(0, 100); });
  }
  if (!store.landing_page) {
    store.landing_page = location.pathname;
    try { var host = document.referrer ? new URL(document.referrer).hostname : ""; store.referrer = host === location.hostname ? "" : host; } catch (e) { store.referrer = ""; }
  }
  try { sessionStorage.setItem("ss_attr", JSON.stringify(store)); } catch (e) {}
  return store;
})();

// Guess the business type from the post that sent them (message match).
function typeFromCampaign() {
  var c = ((attr.utm_campaign || "") + " " + (attr.utm_content || "")).toLowerCase();
  if (/clinic|dental|noshow|no-show|reminder|chair|appoint/.test(c)) return "clinic";
  if (/trade|plumb|pipe|electric|hvac|roof/.test(c)) return "trades";
  if (/cart|checkout|store|shop|ecom|pagespeed|speed/.test(c)) return "store";
  if (/inquir|agent|property|estate|realtor|listing/.test(c)) return "realestate";
  return "";
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("form[data-attr]").forEach(function (form) {
    Object.keys(attr).forEach(function (k) {
      var input = form.querySelector('input[type="hidden"][name="' + k + '"]');
      if (input && attr[k]) input.value = attr[k];
    });
  });
  initShorts();
  initLeakPanel();
  initCheckForm();
  initDock();
});

// Shorts: load and play only while on screen; respect reduced motion.
var PLAY = '<svg viewBox="0 0 16 16"><path d="M4 2l10 6-10 6z"/></svg>';
var PAUSE = '<svg viewBox="0 0 16 16"><path d="M3 2h3.5v12H3zM9.5 2H13v12H9.5z"/></svg>';
function initShorts() {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vids = document.querySelectorAll("video[data-src]");
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      v.inView = e.isIntersecting;
      if (e.isIntersecting) { load(v); if (!v.userPaused) play(v); }
      else if (!v.paused) v.pause();
    });
  }, { rootMargin: "100px 0px", threshold: 0.3 }) : null;

  function load(v) { if (v.getAttribute("src") !== v.dataset.src) { v.src = v.dataset.src; } }
  function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  vids.forEach(function (v) {
    var btn = v.parentNode.querySelector(".short-toggle");
    v.userPaused = reduce;
    function sync() { if (btn) { btn.innerHTML = v.paused ? PLAY : PAUSE; btn.setAttribute("aria-label", v.paused ? "Play video" : "Pause video"); } }
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    sync();
    if (btn) btn.addEventListener("click", function () {
      load(v);
      if (v.paused) { v.userPaused = false; play(v); } else { v.userPaused = true; v.pause(); }
    });
    v.swap = function (name) {
      v.dataset.src = "/media/" + name + ".mp4";
      v.poster = "/media/" + name + ".webp";
      v.removeAttribute("src"); v.load();
      if (v.inView || !io) { load(v); if (!v.userPaused) play(v); }
    };
    if (io) io.observe(v);
  });
}

// Home hero: the business-type chips swap the stat, the Short, and the type sent to the form.
function initLeakPanel() {
  var panel = document.querySelector("[data-leak-panel]");
  var dataEl = document.getElementById("leak-data");
  if (!panel || !dataEl) return;
  var data = JSON.parse(dataEl.textContent);
  var typeInput = document.querySelector("[data-start-type]");
  var video = panel.querySelector("video");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(key, animate) {
    var d = data[key]; if (!d) return;
    function apply() {
      ["figure", "text", "src", "fix"].forEach(function (f) { panel.querySelector('[data-leak="' + f + '"]').innerHTML = d[f]; });
      if (video && video.swap) video.swap(d.video);
      panel.classList.remove("is-swapping");
    }
    if (animate && !reduce) { panel.classList.add("is-swapping"); setTimeout(apply, 180); } else { apply(); }
  }

  function setType(key) { if (typeInput) { typeInput.value = data[key].type; typeInput.disabled = false; } }
  panel.addEventListener("change", function (e) { if (e.target.name === "leak") { show(e.target.value, true); setType(e.target.value); } });

  var guess = typeFromCampaign();
  if (guess && guess !== "realestate") {
    var radio = panel.querySelector('input[value="' + guess + '"]');
    if (radio) { radio.checked = true; show(guess, false); }
  }
  if (guess) setType(guess);
}

// Leak-check form: two steps, prefilled from the home hero or the post that sent them.
function initCheckForm() {
  var form = document.querySelector("[data-check]");
  if (!form) return;
  var step1 = form.querySelector('[data-step="1"]');
  var step2 = form.querySelector('[data-step="2"]');
  var bar2 = form.querySelector("[data-bar2]");
  var label = form.querySelector("[data-step-label]");
  var q = new URLSearchParams(location.search);
  var link = form.elements.link;

  if (q.get("link")) link.value = q.get("link").slice(0, 300);
  var typeMap = { realestate: "Real estate", clinic: "Clinic", trades: "Trades / home services", store: "Online store" };
  var t = q.get("type") || typeMap[typeFromCampaign()];
  if (t) { var r = form.querySelector('input[name="type"][value="' + t.replace(/"/g, "") + '"]'); if (r) r.checked = true; }

  function setErr(input, id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg || "";
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  function check1() {
    var ok = setErr(link, "f-link-err", link.value.trim().length < 4 ? "Paste your website or Google Maps link." : "");
    var typed = form.querySelector('input[name="type"]:checked');
    ok = setErr(null, "f-type-err", typed ? "" : "Pick the closest one.") && ok;
    return ok;
  }
  function check2() {
    var c = form.elements.contact.value.trim();
    var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
    var digits = c.replace(/\D/g, "");
    var isPhone = /^\+?[\d\s().-]+$/.test(c) && digits.length >= 8;
    var ok = setErr(form.elements.contact, "f-contact-err", isEmail || isPhone ? "" : "Add a WhatsApp number with country code, or an email.");
    ok = setErr(form.elements.name, "f-name-err", form.elements.name.value.trim() ? "" : "Add your first name.") && ok;
    ok = setErr(form.elements.business, "f-biz-err", form.elements.business.value.trim() ? "" : "Add your business name.") && ok;
    return ok;
  }
  function go(n) {
    step1.hidden = n !== 1; step2.hidden = n !== 2;
    bar2.classList.toggle("on", n === 2);
    label.textContent = "Step " + n + " of 2";
    var first = (n === 1 ? step1 : step2).querySelector("input:not([type=hidden])");
    if (first) first.focus({ preventScroll: true });
    var top = form.getBoundingClientRect().top;
    if (top < 0) form.scrollIntoView({ block: "start" });
  }

  form.querySelector("[data-next]").addEventListener("click", function () { if (check1()) go(2); });
  form.querySelector("[data-back]").addEventListener("click", function () { go(1); });
  step1.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); if (check1()) go(2); }
  });
  form.addEventListener("submit", function (e) {
    if (!check1()) { e.preventDefault(); go(1); return; }
    if (!check2()) { e.preventDefault(); var bad = step2.querySelector('[aria-invalid="true"]'); if (bad) bad.focus(); return; }
    var btn = form.querySelector('button[type="submit"]');
    btn.setAttribute("aria-busy", "true"); btn.textContent = "Sending…";
  });
  window.addEventListener("pageshow", function () {
    var btn = form.querySelector('button[type="submit"]');
    btn.removeAttribute("aria-busy"); btn.textContent = "Send me my free report";
  });

  // Came from the home hero with a link: skip straight to step 2.
  if (link.value && form.querySelector('input[name="type"]:checked')) { step1.hidden = true; bar2.classList.add("on"); label.textContent = "Step 2 of 2"; }
  else { step2.hidden = true; }
}

// Phones: a slim bar with the main action once the hero has scrolled away.
function initDock() {
  var dock = document.querySelector("[data-dock]");
  var hero = document.querySelector(".hero");
  if (!dock || !hero || !("IntersectionObserver" in window)) return;
  var heroGone = false, footerIn = false;
  function sync() {
    var on = heroGone && !footerIn;
    dock.classList.toggle("is-on", on);
    dock.setAttribute("aria-hidden", on ? "false" : "true");
    dock.querySelectorAll("a").forEach(function (a) { a.tabIndex = on ? 0 : -1; });
  }
  new IntersectionObserver(function (e) { heroGone = !e[0].isIntersecting; sync(); }).observe(hero);
  var foot = document.querySelector(".letter");
  if (foot) new IntersectionObserver(function (e) { footerIn = e[0].isIntersecting; sync(); }).observe(foot);
}
