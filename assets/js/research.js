/* Highlights the table-of-contents entry for the section in view. */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function update() {
    var y = window.scrollY + 140, current = 0;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top + window.scrollY <= y) current = i; });
    links.forEach(function (a, i) { a.classList.toggle("active", i === current); });
  }
  window.addEventListener("scroll", update, { passive: true });
  update();
});
