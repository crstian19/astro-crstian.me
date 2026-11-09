// Staggered entrance: reveals each .animate element in turn (see global.css).
function animate() {
  document.querySelectorAll(".animate").forEach((element, index) => {
    setTimeout(() => element.classList.add("show"), index * 150);
  });
}

// Bundled as a module script, so it runs after parsing; astro:after-swap covers navigations.
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", animate);
else animate();
document.addEventListener("astro:after-swap", animate);
