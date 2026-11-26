document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var S = window.Site, esc = S.esc, I = S.icons;
  var all = (window.SITE_DATA || {}).members || [];
  var FACULTY = (window.SITE_DATA || {}).faculty || {};

  var GROUPS = [
    { key: "faculty", label: "Faculty", wide: true },
    { key: "postdoc", label: "Postdoctoral Researchers", wide: true },
    { key: "phd", label: "Ph.D. Students" },
    { key: "master", label: "Master Students" },
    { key: "visiting", label: "Visiting Professors", wide: true },
    { key: "collaborator", label: "Collaborators", wide: true },
    { key: "alumni", label: "Alumni", compact: true }
  ];
  var FILTERS = [
    { key: "all", label: "All current" },
    { key: "faculty", label: "Faculty" },
    { key: "postdoc", label: "Postdocs" },
    { key: "phd", label: "Ph.D." },
    { key: "master", label: "Master" },
    { key: "visiting,collaborator", label: "Visitors & Collaborators" },
    { key: "alumni", label: "Alumni" }
  ];
  var CURRENT = ["faculty", "postdoc", "phd", "master"];

  /* ---- PI card ---- */
  var pi = all.filter(function (m) { return m.group === "leader"; })[0];
  if (pi) {
    document.getElementById("pi").innerHTML =
      '<div class="pi-photo"><img src="' + esc(pi.photo) + '" alt="Prof. Bin Ren"></div>' +
      '<div><div class="eyebrow">Principal Investigator</div><h2>Prof. Bin Ren</h2>' +
      '<ul class="pi-facts pi-facts-cv">' +
      "<li>Professor, Xiamen Univ. (2004 – )</li>" +
      "<li>Changjiang Scholar Professor (2016 –)</li>" +
      "<li>AvH Fellow, Fritz-Haber Institute, Germany (2002-2003，2004)</li>" +
      "<li>Visiting Scholar, CASI, City College of New York, USA (1997-1998)</li>" +
      "<li>Ph.D., Xiamen Univ. (1998)</li>" +
      "<li>B.Sc., Xiamen Univ. (1992).</li></ul>" +
      '<div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-dark" href="pi.html">Full profile ' + I.arrow + "</a>" +
      '<a class="btn btn-outline" href="mailto:bren@xmu.edu.cn">' + I.mail + " bren@xmu.edu.cn</a></div></div>";
  }

  /* ---- Cards ---- */
  function initials(name) {
    return name.replace(/^(Prof\.|Dr\.|A\.P\.|Assoc\. Prof\.)\s*/i, "").split(/[\s-]+/).filter(Boolean).slice(0, 2)
      .map(function (s) { return s[0]; }).join("").toUpperCase();
  }
  function card(m, compact) {
    var meta = [];
    if (m.group === "alumni") {
      var dy = [m.degree, m.year].filter(Boolean).join(", ");
      if (dy) meta.push('<div class="person-title">' + esc(dy) + "</div>");
      if (m.position) meta.push('<div class="person-meta"><b>Now:</b> ' + esc(m.position) + "</div>");
      if (m.interests) meta.push('<div class="person-meta">' + esc(m.interests) + "</div>");
    } else {
      if (m.title) meta.push('<div class="person-title">' + esc(m.title) + "</div>");
      if (m.interests) meta.push('<div class="person-meta"><b>Research:</b> ' + esc(m.interests) + "</div>");
      if (m.from) meta.push('<div class="person-meta"><b>B.S. from:</b> ' + esc(m.from) + "</div>");
    }
    var foot = [];
    if (m.email) foot.push('<a class="mini-link" href="mailto:' + esc(m.email) + '" title="' + esc(m.email) + '">' + I.mail + "Email</a>");
    // Faculty profiles live on this site (faculty.html); others still link to their external pages.
    var slug = m.name.replace(/^(Assoc\. Prof\.|Prof\.|Dr\.)\s*/i, "").toLowerCase().replace(/\s+/g, "-");
    if (m.group === "faculty" && FACULTY[slug]) {
      foot.push('<a class="mini-link" href="faculty.html?p=' + encodeURIComponent(slug) + '">' + I.user + "Profile</a>");
    } else if (m.more) {
      foot.push('<a class="mini-link" href="' + esc(m.more) + '" target="_blank" rel="noopener">' + I.user + "Profile</a>");
    }
    return '<article class="person">' +
      '<div class="person-photo"><span class="initials">' + esc(initials(m.name)) + "</span>" +
      (m.photo ? '<img src="' + esc(m.photo) + '" alt="' + esc(m.name) + '" loading="lazy" onerror="this.remove()">' : "") +
      '</div><div class="person-body"><div class="person-name">' + esc(m.name) + "</div>" + meta.join("") +
      (foot.length && !compact ? '<div class="person-foot">' + foot.join("") + "</div>" : "") +
      "</div></article>";
  }

  /* ---- Filters & search ---- */
  var state = { filter: "all", q: "" };
  var filtersEl = document.getElementById("member-filters");
  filtersEl.innerHTML = FILTERS.map(function (f) {
    var keys = f.key === "all" ? CURRENT : f.key.split(",");
    var n = all.filter(function (m) { return keys.indexOf(m.group) >= 0; }).length;
    return '<button class="chip" role="tab" data-key="' + f.key + '">' + f.label + ' <span class="count">' + n + "</span></button>";
  }).join("");
  filtersEl.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.filter = b.dataset.key;
    render();
  });
  document.getElementById("member-search").addEventListener("input", function (e) {
    state.q = e.target.value.trim().toLowerCase();
    render();
  });

  var groupsEl = document.getElementById("member-groups");
  function render() {
    filtersEl.querySelectorAll("button").forEach(function (b) {
      var on = b.dataset.key === state.filter;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on);
    });
    var keys = state.filter === "all" ? CURRENT : state.filter.split(",");
    if (state.q) keys = GROUPS.map(function (g) { return g.key; });
    var html = "";
    GROUPS.forEach(function (g) {
      if (keys.indexOf(g.key) < 0) return;
      var list = all.filter(function (m) {
        if (m.group !== g.key) return false;
        if (!state.q) return true;
        return [m.name, m.interests, m.title, m.from, m.position].join(" ").toLowerCase().indexOf(state.q) >= 0;
      });
      if (!list.length) return;
      html += '<section class="group-block"><div class="group-title"><h2>' + g.label + '</h2><span class="count">' + list.length +
        '</span></div><div class="people-grid' + (g.compact ? " compact" : "") + (g.wide ? " wide" : "") + '">' +
        list.map(function (m) { return card(m, g.compact && g.key === "alumni"); }).join("") + "</div></section>";
    });
    groupsEl.innerHTML = html || '<p class="empty">No members match “' + esc(state.q) + "”.</p>";
  }
  render();
});
