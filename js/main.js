(() => {
  const preloader = document.getElementById("preloader");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const finishPreload = () => {
    if (!preloader) {
      document.body.classList.remove("is-loading");
      return;
    }
    preloader.classList.add("is-done");
    preloader.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-loading");
    setTimeout(() => preloader.remove(), reduceMotion ? 0 : 800);
  };

  if (reduceMotion) {
    finishPreload();
  } else {
    const started = performance.now();
    const minVisible = 1500;
    const release = () => {
      const wait = Math.max(0, minVisible - (performance.now() - started));
      setTimeout(finishPreload, wait);
    };
    if (document.readyState === "complete") release();
    else window.addEventListener("load", release, { once: true });
    setTimeout(finishPreload, 4200);
  }

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
  const lookStage = document.getElementById("lookStage");
  const lookFile = document.getElementById("lookFile");
  const lookPreview = document.getElementById("lookPreview");
  const lookClear = document.getElementById("lookClear");
  const sizeRange = document.getElementById("sizeRange");
  const sizeValue = document.getElementById("sizeValue");
  const dateField = document.getElementById("dateField");

  const audio = document.getElementById("bgAudio");
  const soundToggle = document.getElementById("soundToggle");
  const MUTED_KEY = "allgood-music-off";
  const storageGet = (key) => {
    try { return sessionStorage.getItem(key); } catch { return null; }
  };
  const storageSet = (key, value) => {
    try {
      if (value == null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, value);
    } catch { /* private mode */ }
  };
  let wantSound = storageGet(MUTED_KEY) !== "1";
  let musicStart = null;

  const setSoundUi = (on) => {
    if (!soundToggle) return;
    soundToggle.setAttribute("aria-pressed", String(on));
    soundToggle.setAttribute("aria-label", on ? "Muziek uitzetten" : "Muziek aanzetten");
  };

  const fadeMusic = () => {
    if (!audio) return;
    const target = 0.42;
    const startedAt = performance.now();
    const step = (now) => {
      if (!wantSound || audio.paused) return;
      const t = Math.min(1, (now - startedAt) / 1400);
      audio.volume = target * t;
      if (t < 1) requestAnimationFrame(step);
    };
    audio.volume = 0;
    requestAnimationFrame(step);
  };

  const startMusic = () => {
    if (!audio || !wantSound) return Promise.resolve(false);
    if (!audio.paused) return Promise.resolve(true);
    if (musicStart) return musicStart;
    musicStart = audio.play().then(() => {
      if (!wantSound) {
        audio.pause();
        setSoundUi(false);
        return false;
      }
      setSoundUi(true);
      fadeMusic();
      window.removeEventListener("pointerdown", unlockMusic, true);
      window.removeEventListener("keydown", unlockMusic, true);
      return true;
    }).catch(() => {
      setSoundUi(false);
      return false;
    }).finally(() => {
      musicStart = null;
    });
    return musicStart;
  };

  const unlockMusic = () => {
    if (!wantSound || (audio && !audio.paused)) return;
    startMusic();
  };

  if (audio) {
    audio.loop = true;
    audio.volume = 0;
    setSoundUi(false);
    startMusic();
    window.addEventListener("pointerdown", unlockMusic, true);
    window.addEventListener("keydown", unlockMusic, true);
  }

  soundToggle?.addEventListener("click", () => {
    if (!audio) return;
    if (!audio.paused) {
      wantSound = false;
      storageSet(MUTED_KEY, "1");
      audio.pause();
      setSoundUi(false);
      return;
    }
    wantSound = true;
    storageSet(MUTED_KEY, null);
    startMusic();
  });

  const WHATSAPP = "31645536039";
  const MAX_BYTES = 8 * 1024 * 1024;
  let previewUrl = "";

  if (year) year.textContent = String(new Date().getFullYear());

  const onScroll = () => {
    header?.classList.toggle("is-solid", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    menuToggle?.setAttribute("aria-expanded", String(open));
    menuToggle?.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");
    nav?.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  menuToggle?.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  document.querySelectorAll(".hero .reveal").forEach((el, i) => {
    el.style.transitionDelay = `${0.08 + i * 0.08}s`;
    requestAnimationFrame(() => el.classList.add("is-in"));
  });

  const openLightbox = (src, alt, cap) => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    if (lightboxCap) lightboxCap.textContent = cap || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    if (lightboxImg) lightboxImg.src = "";
    if (!document.body.classList.contains("menu-open")) {
      document.body.style.overflow = "";
    }
  };

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.tabIndex = 0;
    const open = () => {
      const img = item.querySelector("img");
      const cap = item.querySelector("figcaption span");
      if (!img) return;
      openLightbox(img.currentSrc || img.src, img.alt, cap?.textContent || "");
    };
    item.addEventListener("click", open);
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (lightbox && !lightbox.hidden) closeLightbox();
    else setMenu(false);
  });

  const heroVideo = document.querySelector(".hero-video");
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) heroVideo?.play?.().catch(() => {});
  });

  if (dateField) {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateField.min = `${today.getFullYear()}-${mm}-${dd}`;
  }

  const updateSize = () => {
    if (sizeRange && sizeValue) sizeValue.textContent = `${sizeRange.value} cm`;
  };
  sizeRange?.addEventListener("input", updateSize);
  updateSize();

  const setStatus = (text, kind) => {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.classList.toggle("is-ok", kind === "ok");
    formStatus.classList.toggle("is-bad", kind === "bad");
  };

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = "";
    if (lookPreview) {
      lookPreview.hidden = true;
      lookPreview.removeAttribute("src");
    }
    lookStage?.classList.remove("has-image");
    if (lookClear) lookClear.hidden = true;
    if (lookFile) lookFile.value = "";
  };

  const showPreview = (file) => {
    if (!file || !lookPreview || !lookStage) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Kies een afbeelding in JPG, PNG of WebP.", "bad");
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus("De foto is groter dan 8 MB. Kies een kleiner bestand.", "bad");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
    lookPreview.onload = () => {
      lookPreview.hidden = false;
      lookStage.classList.add("has-image");
      if (lookClear) lookClear.hidden = false;
      setStatus("Voorbeeld staat. De foto blijft op dit apparaat.", "ok");
    };
    lookPreview.onerror = () => {
      clearPreview();
      setStatus("Dit formaat kan hier niet getoond worden. Kies JPG, PNG of WebP.", "bad");
    };
    lookPreview.src = previewUrl;
  };

  lookFile?.addEventListener("change", () => {
    const file = lookFile.files && lookFile.files[0];
    if (file) showPreview(file);
  });

  lookClear?.addEventListener("click", () => {
    clearPreview();
    setStatus("", "");
  });

  ["dragenter", "dragover"].forEach((type) => {
    lookStage?.addEventListener(type, (e) => {
      e.preventDefault();
      lookStage.classList.add("is-hot");
    });
  });

  ["dragleave", "drop"].forEach((type) => {
    lookStage?.addEventListener(type, (e) => {
      e.preventDefault();
      lookStage.classList.remove("is-hot");
    });
  });

  lookStage?.addEventListener("drop", (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) showPreview(file);
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const date = String(data.get("date") || "").trim();
    const place = String(data.get("place") || "").trim();
    const message = String(data.get("message") || "").trim();
    const size = String(data.get("size") || "").trim();

    if (!name || !phone || !place || !message) {
      setStatus("Vul naam, telefoon, plek en motief in.", "bad");
      form.reportValidity();
      return;
    }

    const lines = [
      "Hallo All Good Tattoo, ik wil graag een afspraak aanvragen.",
      `Naam: ${name}`,
      `Telefoon: ${phone}`,
      date ? `Gewenste datum: ${date}` : "",
      `Grootte: ca. ${size} cm`,
      `Plek: ${place}`,
      `Motief: ${message}`,
      previewUrl ? "Ik stuur een referentiefoto mee in deze chat." : ""
    ].filter(Boolean);

    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
    const opened = window.open(url, "_blank", "noopener");
    if (!opened) {
      window.location.href = url;
    }
    setStatus("WhatsApp opent. Hang de foto daar als bijlage aan.", "ok");
  });
})();
