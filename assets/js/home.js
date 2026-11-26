document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var D = window.SITE_DATA || {}, S = window.Site, esc = S.esc;

  /* ---- Carousel ---- */
  var slides = D.slides || [];
  var car = document.getElementById("highlights");
  var track = car.querySelector(".carousel-track"), dots = car.querySelector(".carousel-dots");
  track.innerHTML = slides.map(function (s, i) {
    return '<div class="carousel-slide"><a href="' + esc(s.link) + '" target="_blank" rel="noopener"><img src="' + esc(s.img) +
      '" alt="Highlight ' + (i + 1) + '"' + (i ? ' loading="lazy"' : "") + "></a></div>";
  }).join("");
  dots.innerHTML = slides.map(function (_, i) {
    return '<button role="tab" aria-label="Slide ' + (i + 1) + '" data-i="' + i + '"></button>';
  }).join("");
  var idx = 0, timer;
  function go(i) {
    idx = (i + slides.length) % slides.length;
    track.style.transform = "translateX(" + -idx * 100 + "%)";
    dots.querySelectorAll("button").forEach(function (b, j) {
      b.classList.toggle("active", j === idx);
      b.setAttribute("aria-selected", j === idx);
    });
  }
  function auto() { clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 6000); }
  dots.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { go(+b.dataset.i); auto(); } });
  car.querySelectorAll("[data-dir]").forEach(function (b) {
    b.addEventListener("click", function () { go(idx + +b.dataset.dir); auto(); });
  });
  car.addEventListener("mouseenter", function () { clearInterval(timer); });
  car.addEventListener("mouseleave", auto);
  var sx = null;
  car.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  car.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); auto(); }
    sx = null;
  });
  if (slides.length) { go(0); auto(); }

  /* ---- News ---- */
  document.getElementById("home-news").innerHTML = (D.news || []).slice(0, 5).map(function (n) {
    var p = n.date.split("-"), k = S.newsKind(n.text);
    var text = n.link ? '<a href="' + esc(n.link) + '" target="_blank" rel="noopener">' + esc(n.text) + "</a>" : esc(n.text);
    return '<li class="news-item"><div class="news-date"><span class="d">' + p[2] + '</span><span class="ym">' + S.months[+p[1] - 1] + " " + p[0] +
      '</span></div><div><div class="news-kind"><span class="tag ' + k[0] + '">' + k[1] + '</span></div><p class="news-text">' + text + "</p></div></li>";
  }).join("");

  /* ---- Publications ---- */
  document.getElementById("home-pubs").innerHTML = (D.publications || []).slice(0, 4).map(function (p) {
    var journal = (p.source || "").replace(/,?\s*\d{4}.*$/, "") + " · " + p.year;
    return '<a class="pm" href="' + esc(p.link) + '" target="_blank" rel="noopener"><div class="pm-thumb">' +
      (p.img ? '<img src="' + esc(p.img) + '" alt="" loading="lazy">' : "") +
      '</div><div><div class="pm-title">' + esc(p.title) + '</div><div class="pm-journal">' + esc(journal.trim()) + "</div></div></a>";
  }).join("");
});

/* ---- Section-by-section scrolling on the home page ----
   When scrolling stops with the screen straddling two sections, glide (in the direction the
   user was scrolling) to the nearest section edge. Sections taller than the screen scroll
   freely inside and only align once their edge comes into view. */
(function () {
  "use strict";
  if (!document.documentElement.classList.contains("snap-page")) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var settled = window.scrollY, timer = null, auto = false, autoTimer = null;

  function headerH() {
    var h = document.getElementById("site-header");
    return h ? h.offsetHeight : 0;
  }
  function points() {
    var max = document.documentElement.scrollHeight - window.innerHeight, hh = headerH();
    var pts = Array.prototype.map.call(document.querySelectorAll("main > section"), function (s) {
      return Math.max(0, Math.min(max, Math.round(s.getBoundingClientRect().top + window.scrollY - hh)));
    });
    pts.unshift(0);   // page top is always a stop
    pts.push(max);
    return pts.filter(function (v, i, a) { return i === 0 || v > a[i - 1] + 4; });
  }
  function go(y) {
    auto = true;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    clearTimeout(autoTimer);
    autoTimer = setTimeout(function () { auto = false; settled = window.scrollY; }, reduce ? 50 : 900);
  }
  function snap() {
    if (window.innerHeight < 500) { settled = window.scrollY; return; }
    var y = window.scrollY, dir = y - settled;
    if (Math.abs(dir) < 6) return;
    var pts = points(), view = window.innerHeight - headerH();
    for (var i = 0; i < pts.length - 1; i++) {
      var top = pts[i], next = pts[i + 1];
      if (y < top - 2 || y > next + 2) continue;
      if (Math.abs(y - top) <= 2 || Math.abs(y - next) <= 2) break; // already aligned
      var freeEnd = next - view;                                    // last position showing only this section
      if (next - top > view + 40 && y <= freeEnd) break;            // inside a tall section: leave it
      var target = dir > 0 ? next : (next - top > view + 40 ? freeEnd : top);
      go(target);
      return;
    }
    settled = y;
  }
  window.addEventListener("scroll", function () {
    if (auto) return;
    clearTimeout(timer);
    timer = setTimeout(snap, 140);
  }, { passive: true });
})();
