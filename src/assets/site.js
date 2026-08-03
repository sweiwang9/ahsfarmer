// Two features only: the mobile nav toggle and the page filter.
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var input = document.getElementById("filter-input");
  if (!input) return;
  var status = document.querySelector(".filter-status");
  var entries = [].slice.call(document.querySelectorAll(".entry"));
  var groups = [].slice.call(document.querySelectorAll(".year-group"));
  var sections = [].slice.call(document.querySelectorAll(".entry-section"));

  function hideIfEmpty(el) {
    el.hidden = !el.querySelector(".entry:not([hidden])");
  }

  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    entries.forEach(function (el) {
      var match = !q || el.textContent.toLowerCase().indexOf(q) !== -1;
      el.hidden = !match;
      if (match) shown++;
    });
    groups.forEach(hideIfEmpty);
    sections.forEach(hideIfEmpty);
    if (status) {
      status.textContent = !q
        ? ""
        : shown === 0
        ? "Nothing matches “" + input.value.trim() + "”."
        : shown + " of " + entries.length + " shown";
    }
  });
})();
