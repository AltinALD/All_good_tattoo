(() => {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const menuToggle = document.getElementById("menuToggle");
  const year = document.getElementById("year");
  const form = document.getElementById("bookForm");
  const formStatus = document.getElementById("formStatus");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCap = document.getElementById("lightboxCap");
  const lightboxClose = document.getElementById("lightboxClose");

  if (year) year.textContent = String(new Date().getFullYear());

  const onScroll = () => {
    header?.classList.toggle("is-solid", window.scrollY > 48);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    nav?.classList.toggle("is-open", !open);
    header?.classList.toggle("menu-open", !open);
    document.body.style.overflow = open ? "" : "hidden";
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle?.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      header?.classList.remove("menu-open");
      document.body.style.overflow = "";
    });
  });

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  document.querySelectorAll(".hero .reveal").forEach((el, i) => {
    el.style.transitionDelay = `${0.12 + i * 0.1}s`;
    requestAnimationFrame(() => el.classList.add("is-in"));
  });

  const items = document.querySelectorAll(".gallery-item");

  const openLightbox = (src, alt, cap) => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    if (lightboxCap) lightboxCap.textContent = cap || "";
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => {
      lightbox.hidden = true;
      if (lightboxImg) lightboxImg.src = "";
    }, 350);
  };

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      const cap = item.querySelector("figcaption span");
      if (!img) return;
      openLightbox(img.currentSrc || img.src, img.alt, cap?.textContent || "");
    });
  });

  const heroVideo = document.querySelector(".hero-video");
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) heroVideo?.play().catch(() => {});
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  /* Termin-Anfrage → E-Mail an kokosbookings@gmail.com */
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const age = String(data.get("age") || "").trim();
    const description = String(data.get("description") || "").trim();
    const placement = String(data.get("placement") || "").trim();
    const size = String(data.get("size") || "").trim();
    const availability = String(data.get("availability") || "").trim();

    if (!name || !age || !description || !placement || !size || !availability) {
      if (formStatus) {
        formStatus.textContent = "Bitte alle Felder ausfüllen.";
        formStatus.classList.remove("is-ok");
      }
      return;
    }

    if (Number(age) < 19) {
      if (formStatus) {
        formStatus.textContent = "Termine nur ab 19 Jahren.";
        formStatus.classList.remove("is-ok");
      }
      return;
    }

    const body = [
      `Name: ${name}`,
      `Alter: ${age}`,
      `Tattoo-Beschreibung: ${description}`,
      `Platzierung: ${placement}`,
      `Größe in cm: ${size}`,
      `Verfügbarkeit: ${availability}`,
    ].join("\n");

    const mailto =
      "mailto:kokosbookings@gmail.com" +
      "?subject=" +
      encodeURIComponent(`Terminanfrage — ${name}`) +
      "&body=" +
      encodeURIComponent(body);

    window.location.href = mailto;

    if (formStatus) {
      formStatus.textContent = "E-Mail-Programm wird geöffnet…";
      formStatus.classList.add("is-ok");
    }
  });
})();
