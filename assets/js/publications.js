document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var S = window.Site, esc = S.esc, I = S.icons;
  var pubs = (window.SITE_DATA || {}).publications || [];
  var EARLY = 2003; // the old site groups everything up to 2003 together

  var years = [];
  pubs.forEach(function (p) { if (years.indexOf(p.year) < 0) years.push(p.year); });
  years.sort(function (a, b) { return b - a; });

  var state = { year: "all", q: "" };
  var hash = location.hash.replace("#", "");
  if (/^\d{4}$/.test(hash) && years.indexOf(+hash) >= 0) state.year = +hash;

  var yearList = document.getElementById("year-list");
  yearList.innerHTML = '<button class="all" data-y="all">All years</button>' + years.map(function (y) {
    return '<button data-y="' + y + '">' + (y === EARLY ? "≤" + y : y) + "</button>";
  }).join("");
  yearList.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.year = b.dataset.y === "all" ? "all" : +b.dataset.y;
    history.replaceState(null, "", state.year === "all" ? location.pathname : "#" + state.year);
    render();
    var top = document.querySelector(".pub-layout").getBoundingClientRect().top + window.scrollY - 100;
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: "smooth" });
  });

  var input = document.getElementById("pub-search");
  var t;
  input.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = input.value.trim(); render(); }, 120);
  });

  function hl(text, q) {
    var s = esc(text);
    if (!q) return s;
    var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return s.replace(re, "<mark>$1</mark>");
  }
  function authors(a, q) {
    // Bold the PI's name in its various spellings.
    return hl(a, q).replace(/(Bin\s+Ren\*?|B\.\s*Ren\*?)/g, "<b>$1</b>");
  }

  function item(p, q) {
    var links = [];
    if (p.link) links.push('<a class="mini-link" href="' + esc(p.link) + '" target="_blank" rel="noopener">' + I.ext + (p.doi ? "DOI " + hl(p.doi, q) : "Link") + "</a>");
    return '<article class="pub" id="p' + p.n + '"><div class="pub-n">' + p.n + "</div><div>" +
      '<div class="pub-title">' + (p.link ? '<a href="' + esc(p.link) + '" target="_blank" rel="noopener">' + hl(p.title, q) + "</a>" : hl(p.title, q)) + "</div>" +
      '<div class="pub-cite">' + authors(p.authors, q) + (p.source ? ", <em>" + hl(p.source, q) + "</em>" : "") + "</div>" +
      '<div class="pub-links">' + links.join("") + "</div></div>" +
      (p.img ? '<div class="pub-thumb" data-zoom><img src="' + esc(p.img) + '" alt="Graphical abstract" loading="lazy" onerror="this.parentNode.remove()"></div>' : "<div></div>") +
      "</article>";
  }

  var listEl = document.getElementById("pub-list"), countEl = document.getElementById("pub-count");
  function render() {
    yearList.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("active", String(state.year) === b.dataset.y);
    });
    var q = state.q.toLowerCase();
    var list = pubs.filter(function (p) {
      if (state.year !== "all" && p.year !== state.year) return false;
      if (!q) return true;
      return (p.title + " " + p.authors + " " + p.source + " " + p.doi).toLowerCase().indexOf(q) >= 0;
    });
    countEl.innerHTML = "Showing <b>" + list.length + "</b> of " + pubs.length;
    if (!list.length) { listEl.innerHTML = '<p class="empty">No publications match your search.</p>'; return; }
    var html = "", cur = null;
    list.forEach(function (p) {
      if (p.year !== cur) {
        cur = p.year;
        var n = list.filter(function (x) { return x.year === cur; }).length;
        html += '<h2 class="pub-year-head">' + (cur === EARLY ? "2003 &amp; earlier" : cur) + "<small>" + n + (n > 1 ? " papers" : " paper") + "</small></h2>";
      }
      html += item(p, state.q);
    });
    listEl.innerHTML = html;
  }
  render();
});
