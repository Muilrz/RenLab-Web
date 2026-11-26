/* Shared header / footer / UI helpers for every page. */
(function () {
  "use strict";

  var ICONS = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    scholar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
  };

  var NAV = [
    ["home", "index.html", "Home"],
    ["research", "research.html", "Research"],
    ["members", "members.html", "Members"],
    ["publications", "publications.html", "Publications"],
    ["news", "news.html", "News"],
    ["lab", "lab.html", "Lab Tour"],
    ["gallery", "gallery.html", "Gallery"]
  ];

  var BRAND_SVG =
    '<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">' +
    '<defs><linearGradient id="bm" x1="0" x2="1"><stop offset="0" stop-color="#4ca3ff"/><stop offset="1" stop-color="#1a6cb3"/></linearGradient></defs>' +
    '<rect width="40" height="40" rx="11" fill="#eef6ff" stroke="#d6e8fb"/>' +
    '<path d="M5 29 L11 28.5 L13 22 L15 28 L18 27.5 L20.5 9 L23 27 L26 26.5 L28 18 L30 26.5 L35 27" fill="none" stroke="url(#bm)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    "</svg>";

  function brand() {
    return (
      '<a class="brand" href="index.html" aria-label="Ren Research Group home">' + BRAND_SVG +
      '<span class="brand-text"><span class="brand-name">Ren Research Group</span>' +
      '<span class="brand-sub">Xiamen University</span></span></a>'
    );
  }

  function renderHeader(page) {
    var el = document.getElementById("site-header");
    if (!el) return;
    var links = NAV.map(function (n) {
      return '<a href="' + n[1] + '"' + (n[0] === page ? ' class="active" aria-current="page"' : "") + ">" + n[2] + "</a>";
    }).join("");
    links += '<a class="nav-cta' + (page === "join" ? " active" : "") + '" href="join.html">Join Us</a>';
    el.className = "site-header is-transparent";
    el.innerHTML =
      '<div class="container">' + brand() +
      '<nav class="nav" id="main-nav" aria-label="Main">' + links + "</nav>" +
      '<button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav">' + ICONS.menu + "</button>" +
      "</div>";

    var toggle = el.querySelector(".nav-toggle");
    var nav = el.querySelector(".nav");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      toggle.innerHTML = open ? ICONS.close : ICONS.menu;
      el.classList.toggle("menu-open", open);
      onScroll();
    });

    function onScroll() {
      var scrolled = window.scrollY > 24 || el.classList.contains("menu-open");
      el.classList.toggle("is-transparent", !scrolled);
      el.classList.toggle("is-scrolled", scrolled);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    var year = new Date().getFullYear();
    el.className = "site-footer";
    el.innerHTML =
      '<div class="container"><div class="footer-grid">' +
      '<div>' + brand() +
      '<p class="footer-about">Advanced spectroscopic and electrochemical instrumentation and methodology for molecular-level studies of surfaces, interfaces, energy and biological systems.</p></div>' +
      "<div><h4>Explore</h4><ul>" +
      NAV.slice(1).map(function (n) { return '<li><a href="' + n[1] + '">' + n[2] + "</a></li>"; }).join("") +
      '<li><a href="join.html">Join Us</a></li></ul></div>' +
      "<div><h4>Affiliations</h4><ul>" +
      '<li><a href="https://en.xmu.edu.cn/" target="_blank" rel="noopener">Xiamen University</a></li>' +
      '<li><a href="https://chem.xmu.edu.cn/en/" target="_blank" rel="noopener">College of Chemistry &amp; Chemical Engineering</a></li>' +
      '<li><a href="https://pcoss.xmu.edu.cn/" target="_blank" rel="noopener">State Key Lab of PCOSS</a></li>' +
      '<li><a href="https://2011-ichem.xmu.edu.cn/en/" target="_blank" rel="noopener">iChEM Center</a></li>' +
      '<li><a href="https://ramancloud.xmu.edu.cn/" target="_blank" rel="noopener">Raman Cloud</a></li>' +
      "</ul></div>" +
      "<div><h4>Contact</h4><ul>" +
      "<li>Room 434, Department of Chemistry, Siming Campus, Xiamen University, Xiamen 361005</li>" +
      "<li>Room 2301, IKKEM Building, Xiang'an Campus, Xiamen University, Xiamen 361102</li>" +
      '<li><a href="mailto:bren@xmu.edu.cn">bren@xmu.edu.cn</a> · 0592-2186532</li>' +
      "</ul></div>" +
      "</div>" +
      '<div class="footer-bottom"><span>© ' + year + " Ren Research Group, Xiamen University. All rights reserved.</span>" +
      "<span>厦门大学 化学化工学院 · 任斌课题组</span></div></div>";
  }

  /* ---- Spectrum path generator (sum of Lorentzian peaks) ---- */
  function spectrumPath(w, h, peaks, base, steps) {
    steps = steps || 600;
    var pts = [];
    for (var i = 0; i <= steps; i++) {
      var x = i / steps;
      var y = 0.02 * Math.sin(x * 37) * Math.sin(x * 11) + 0.05 * x;
      for (var k = 0; k < peaks.length; k++) {
        var p = peaks[k], d = (x - p[0]) / p[2];
        y += p[1] / (1 + d * d);
      }
      pts.push([x * w, base - y * h]);
    }
    return pts;
  }
  function toPath(pts) {
    return pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("");
  }

  var GRAD =
    '<defs><linearGradient id="specGrad" x1="0" x2="1"><stop offset="0" stop-color="#a9d3ff"/><stop offset=".45" stop-color="#4ca3ff"/><stop offset="1" stop-color="#2387e4"/></linearGradient>' +
    '<linearGradient id="specFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4ca3ff" stop-opacity=".16"/><stop offset="1" stop-color="#4ca3ff" stop-opacity="0"/></linearGradient></defs>';

  function heroSpectrum(el) {
    var W = 1600, H = 300, base = 280;
    var peaks = [[0.07, 0.08, 0.012], [0.15, 0.15, 0.008], [0.24, 0.1, 0.015], [0.33, 0.18, 0.007], [0.43, 0.12, 0.012],
      [0.56, 0.34, 0.008], [0.63, 0.95, 0.005], [0.69, 0.28, 0.012], [0.77, 0.62, 0.006], [0.85, 0.22, 0.018], [0.93, 0.42, 0.007]];
    var pts = spectrumPath(W, 240, peaks, base, 800);
    var d = toPath(pts);
    var labels = [[0.56, "1350"], [0.63, "1585"], [0.77, "2105"], [0.93, "2930"]];
    var lab = labels.map(function (l, i) {
      var idx = Math.round(l[0] * 800), p = pts[idx];
      var delay = (2.2 + i * 0.25).toFixed(2);
      return '<line class="peak-line" x1="' + p[0] + '" x2="' + p[0] + '" y1="' + (p[1] - 10) + '" y2="' + (p[1] - 34) + '" style="animation-delay:' + delay + 's"/>' +
        '<text class="peak-label" x="' + p[0] + '" y="' + (p[1] - 42) + '" text-anchor="middle" style="animation-delay:' + delay + 's">' + l[1] + "</text>";
    }).join("");
    el.innerHTML = '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" aria-hidden="true">' + GRAD +
      '<path class="area" d="' + d + "L" + W + " " + H + "L0 " + H + 'Z"/>' +
      '<path class="trace" d="' + d + '"/>' + lab + "</svg>";
  }

  function pageSpectrum(el) {
    var W = 640, H = 200, base = 190;
    var seed = (document.body.getAttribute("data-page") || "x").length;
    var peaks = [];
    for (var i = 0; i < 7; i++) {
      peaks.push([0.1 + i * 0.13 + ((seed * (i + 3)) % 7) * 0.006, 0.15 + ((seed * (i + 1) * 7) % 10) / 14, 0.006 + (i % 3) * 0.004]);
    }
    var d = toPath(spectrumPath(W, 150, peaks, base, 400));
    el.innerHTML = '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" aria-hidden="true">' + GRAD +
      '<path d="' + d + "L" + W + " " + H + "L0 " + H + 'Z" fill="url(#specFill)"/>' +
      '<path d="' + d + '" fill="none" stroke="url(#specGrad)" stroke-width="2"/></svg>';
  }

  /* ---- Lightbox ---- */
  var lb;
  function openLightbox(src, alt) {
    if (!lb) {
      lb = document.createElement("div");
      lb.className = "lightbox";
      lb.setAttribute("role", "dialog");
      lb.setAttribute("aria-modal", "true");
      lb.innerHTML = '<img alt=""><button class="lightbox-close" aria-label="Close">' + ICONS.close + "</button>";
      lb.addEventListener("click", function () { lb.classList.remove("open"); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") lb.classList.remove("open"); });
      document.body.appendChild(lb);
    }
    var img = lb.querySelector("img");
    img.src = src;
    img.alt = alt || "";
    lb.classList.add("open");
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-zoom]") : null;
    if (!t) return;
    var img = t.tagName === "IMG" ? t : t.querySelector("img");
    if (!img) return;
    e.preventDefault();
    openLightbox(img.currentSrc || img.src, img.alt);
  });

  /* ---- Reveal on scroll ---- */
  function initReveal(root) {
    var els = (root || document).querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
  }

  function backToTop() {
    var b = document.createElement("button");
    b.className = "back-top";
    b.setAttribute("aria-label", "Back to top");
    b.innerHTML = ICONS.up;
    b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(b);
    window.addEventListener("scroll", function () { b.classList.toggle("show", window.scrollY > 900); }, { passive: true });
  }

  /* ---- Background light: a few large, very blurred patches flowing slowly (bottom band + two near the top) ---- */
  function backgroundFx() {
    if (document.querySelector(".bg-fx")) return;
    // [left %, anchored edge, offset %, width vw, colour (0 light blue, 1 sky cyan, 2 pale teal-green), drift vw, rise px, duration s]
    var patches = [
      [8, "bottom", -11, 42, 0, 14, 40, 58],
      [34, "bottom", -16, 36, 1, -12, 30, 72],
      [58, "bottom", -12, 48, 2, 16, 46, 64],
      [84, "bottom", -15, 40, 0, -14, 36, 50],
      [22, "bottom", -21, 54, 2, 10, 24, 80],
      [70, "bottom", -22, 50, 1, -10, 28, 68],
      [90, "top", -16, 44, 1, -10, -30, 66],   // top-right
      [12, "top", -20, 36, 2, 12, -24, 76]     // top-left
    ];
    var now = Date.now() / 1000; // shared clock: the flow continues smoothly from page to page
    var html = patches.map(function (p, i) {
      return '<span class="fx-blob c' + p[4] + '" style="left:' + p[0] + "%;" + p[1] + ":" + p[2] + "%;--w:" + p[3] +
        "vw;--fx:" + p[5] + "vw;--fy:" + p[6] + "px;animation-duration:" + p[7] + "s;animation-delay:" + (-((now + i * 9) % p[7])).toFixed(2) + 's"></span>';
    }).join("");
    var fx = document.createElement("div");
    fx.className = "bg-fx";
    fx.setAttribute("aria-hidden", "true");
    fx.innerHTML = html;
    document.body.insertBefore(fx, document.body.firstChild);
  }

  /* ---- Liquid Glass: the specular highlight follows the pointer (fine pointers only) ---- */
  var GLASS_SEL = ".r-card, .person, .pub, .news-card, .inst, .honor, .link-card, .position-card, .album-grid figure, " +
    ".pi-card, .profile-card, .address-card, .hiring-card, .scholar-link, .btn-outline, .btn-ghost, .chip, " +
    ".year-nav-list button, .icon-btn, .search input, .back-top";
  function glassPointer() {
    if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var pending = null, last = null;
    document.addEventListener("pointermove", function (e) {
      var el = e.target.closest ? e.target.closest(GLASS_SEL) : null;
      if (!el) return;
      last = { el: el, x: e.clientX, y: e.clientY };
      if (pending) return;
      pending = requestAnimationFrame(function () {
        pending = null;
        var r = last.el.getBoundingClientRect();
        last.el.style.setProperty("--mx", Math.round(last.x - r.left) + "px");
        last.el.style.setProperty("--my", Math.round(last.y - r.top) + "px");
      });
    }, { passive: true });
  }

  /* ---- Small helpers shared by page scripts ---- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function newsKind(text) {
    if (/award|prize|fellow|elected|honou?r/i.test(text)) return ["award", "Award"];
    if (/paper|article|published|review/i.test(text)) return ["paper", "Paper"];
    return ["event", "Event"];
  }
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* ---- Page transitions ----
     Cross-document View Transitions are declared in CSS (@view-transition).
     Here: (a) content already on screen skips its own reveal when arriving through a transition,
           (b) a short JS fade for browsers without support,
           (c) prerender in-site pages on hover so the switch is near-instant. */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rootEl = document.documentElement;
  var hasCrossDocVT = "onpagereveal" in window && typeof document.startViewTransition === "function";

  window.addEventListener("pagereveal", function (e) {
    if (!e.viewTransition) return;
    rootEl.classList.add("pt-arrive");
    var done = function () { setTimeout(function () { rootEl.classList.remove("pt-arrive"); }, 60); };
    e.viewTransition.finished.then(done, done);
  });

  function isInternalPageLink(a, e) {
    if (!a || a.target || a.hasAttribute("download") || e.defaultPrevented || e.button !== 0) return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html?$|\/$/.test(url.pathname)) return false;
    return !(url.pathname === location.pathname && url.hash); // same-page anchors scroll normally
  }

  if (!hasCrossDocVT && !reduceMotion) {
    rootEl.classList.add("pt-fallback");
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!isInternalPageLink(a, e)) return;
      e.preventDefault();
      rootEl.classList.add("pt-leave");
      setTimeout(function () { location.href = a.href; }, 190);
    });
    // Coming back via the back/forward cache: undo the fade-out
    window.addEventListener("pageshow", function (e) { if (e.persisted) rootEl.classList.remove("pt-leave"); });
  }

  if (window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")) {
    var rules = document.createElement("script");
    rules.type = "speculationrules";
    rules.textContent = JSON.stringify({
      prerender: [{
        source: "document",
        where: { and: [{ href_matches: "/*" }, { not: { selector_matches: "[target], [download]" } }] },
        eagerness: "moderate"
      }]
    });
    document.head.appendChild(rules);
  }

  window.Site = {
    icons: ICONS, esc: esc, newsKind: newsKind, months: MONTHS,
    initReveal: initReveal, openLightbox: openLightbox,
    data: window.SITE_DATA || {}
  };

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-page");
    renderHeader(page);
    renderFooter();
    backgroundFx();
    glassPointer();
    var hs = document.querySelector(".hero-spectrum");
    if (hs) heroSpectrum(hs);
    document.querySelectorAll(".page-hero-spec").forEach(pageSpectrum);
    document.querySelectorAll("[data-icon]").forEach(function (e) { e.innerHTML = ICONS[e.getAttribute("data-icon")] || ""; });
    backToTop();
    initReveal();
  });
})();
