document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var D = window.SITE_DATA || {}, S = window.Site, esc = S.esc;

  /* ---- Stats ---- */
  var members = D.members || [];
  var current = members.filter(function (m) { return /leader|faculty|postdoc|phd|master/.test(m.group); }).length;
  var alumni = members.filter(function (m) { return m.group === "alumni"; }).length;
  var stats = [
    [(D.publications || []).length, "+", "Peer-reviewed publications"],
    [current, "", "Current members"],
    [alumni, "+", "Alumni worldwide"],
    [new Date().getFullYear() - 2004, "", "Years as an independent group"]
  ];
  var statsEl = document.getElementById("stats");
  statsEl.innerHTML = stats.map(function (s) {
    return '<div class="stat"><div class="stat-num" data-to="' + s[0] + '">0<sup>' + s[1] + '</sup></div><div class="stat-label">' + s[2] + "</div></div>";
  }).join("");
  var counted = false;
  function countUp() {
    if (counted) return;
    counted = true;
    statsEl.querySelectorAll(".stat-num").forEach(function (el) {
      var to = +el.getAttribute("data-to"), sup = el.querySelector("sup").outerHTML, t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
        el.innerHTML = v + sup;
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { countUp(); o.disconnect(); } }).observe(statsEl);
  } else countUp();

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
