document.addEventListener("DOMContentLoaded", () => {
  /* ---- Mobilné menu ---- */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Aktívny odkaz v navigácii ---- */
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = (link.getAttribute("href") || "").split("/").pop();
    if (href === currentPath) {
      link.classList.add("active");
    }
  });

  /* ---- Postupné odhalenie sekcií pri scrollovaní ---- */
  const revealTargets = document.querySelectorAll(".reveal");

  if (!revealTargets.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const revealAll = () => revealTargets.forEach((el) => el.classList.add("is-visible"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    // Odhalí prvok skôr, ako sa dostane do zobrazenia (aj pri rýchlom scrollovaní).
    { threshold: 0, rootMargin: "0px 0px 15% 0px" }
  );

  revealTargets.forEach((el) => observer.observe(el));

  // Záchranná sieť: obsah nesmie zostať skrytý, ak observer z akéhokoľvek
  // dôvodu nespustí (rýchly scroll, tlač stránky, chyba prehliadača).
  window.setTimeout(revealAll, 2500);
  window.addEventListener("beforeprint", revealAll);
});

/* ---- Lightbox pre fotky služieb ---- */
document.addEventListener("DOMContentLoaded", () => {
  const photos = Array.from(document.querySelectorAll(".photo-slot img"));
  if (!photos.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-label", "Náhľad fotografie");
  lightbox.innerHTML = `
    <img alt="" />
    <div class="lightbox-caption"></div>
    <button class="lightbox-close" type="button" aria-label="Zavrieť">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>
    <button class="lightbox-prev" type="button" aria-label="Predchádzajúca fotka">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <button class="lightbox-next" type="button" aria-label="Ďalšia fotka">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
    </button>`;
  document.body.appendChild(lightbox);

  const bigImg = lightbox.querySelector("img");
  const caption = lightbox.querySelector(".lightbox-caption");
  let current = -1;

  const show = (index) => {
    // Preskočí fotky, ktoré sa nenačítali (skryté placeholdery).
    const visible = photos.filter((p) => p.naturalWidth > 0);
    if (!visible.length) return;
    current = (index + visible.length) % visible.length;
    const photo = visible[current];
    bigImg.src = photo.src;
    bigImg.alt = photo.alt;
    caption.textContent = photo.alt;
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    current = -1;
  };

  photos.forEach((photo) => {
    photo.addEventListener("click", () => {
      const visible = photos.filter((p) => p.naturalWidth > 0);
      show(visible.indexOf(photo));
    });
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", close);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", () => show(current - 1));
  lightbox.querySelector(".lightbox-next").addEventListener("click", () => show(current + 1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });
});
