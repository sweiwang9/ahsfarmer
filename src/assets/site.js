// Two features only: the mobile nav toggle and the list filter.
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

  var input = document.getElementById("filter-input");
  if (!input) return;
  var status = document.querySelector(".filter-status");
  var entries = Array.prototype.slice.call(document.querySelectorAll(".entry"));

  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    entries.forEach(function (el) {
      var match = !q || el.textContent.toLowerCase().indexOf(q) !== -1;
      el.hidden = !match;
      if (match) shown++;
    });
    document.querySelectorAll(".year-group").forEach(function (group) {
      var any = group.querySelector(".entry:not([hidden])");
      group.hidden = !any;
    });
    if (status) {
      status.textContent = q ? shown + " of " + entries.length + " shown" : "";
    }
  });
})();
