document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;

  // ============ STRINGS (dynamic content that can't carry data-fr/data-en) ============
  const STRINGS = {
    fr: {
      formSending: "Envoi en cours...",
      formSuccess: "✓ Message envoyé avec succès !",
      formError: "✗ Échec de l'envoi. Merci de réessayer.",
      subjectLabel: { project: "Projet", opportunity: "Opportunité", other: "Autre" }
    },
    en: {
      formSending: "Sending...",
      formSuccess: "✓ Message sent successfully!",
      formError: "✗ Failed to send message. Please try again.",
      subjectLabel: { project: "Project", opportunity: "Opportunity", other: "Other" }
    }
  };

  // ============ LANGUAGE ENGINE ============
  let currentLang = html.dataset.pendingLang || html.lang || "fr";

  function applyLang(lang) {
    currentLang = lang === "en" ? "en" : "fr";
    html.lang = currentLang;

    document.querySelectorAll("[data-fr]").forEach((el) => {
      const value = el.dataset[currentLang];
      if (value === undefined) return;
      if (el.tagName === "META") {
        el.setAttribute("content", value);
      } else if (el.tagName === "OPTION" || el.tagName === "TITLE") {
        el.textContent = value;
      } else {
        el.innerHTML = value;
      }
    });

    document.querySelectorAll("[data-fr-placeholder]").forEach((el) => {
      const value = currentLang === "en" ? el.dataset.enPlaceholder : el.dataset.frPlaceholder;
      if (value !== undefined) el.setAttribute("placeholder", value);
    });

    document.querySelectorAll("[data-fr-aria-label]").forEach((el) => {
      const value = currentLang === "en" ? el.dataset.enAriaLabel : el.dataset.frAriaLabel;
      if (value !== undefined) el.setAttribute("aria-label", value);
    });

    const langSwitch = document.getElementById("lang-switch");
    if (langSwitch) {
      langSwitch.dataset.active = currentLang;
      langSwitch.querySelectorAll(".lang-opt").forEach((opt) => {
        opt.classList.toggle("active", opt.dataset.lang === currentLang);
      });
    }
  }

  function setLang(lang) {
    applyLang(lang);
    try { localStorage.setItem("lang", currentLang); } catch (e) {}
  }

  applyLang(currentLang);

  const langSwitchBtn = document.getElementById("lang-switch");
  if (langSwitchBtn) {
    langSwitchBtn.addEventListener("click", () => {
      setLang(currentLang === "fr" ? "en" : "fr");
    });
  }

  // ============ THEME ENGINE ============
  function setTheme(theme) {
    html.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) {}
  }

  const themeSwitchBtn = document.getElementById("theme-switch");
  if (themeSwitchBtn) {
    themeSwitchBtn.addEventListener("click", () => {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const current = html.getAttribute("data-theme") || (prefersDark ? "dark" : "light");
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  // ============ ATMOSPHERE: MOUSE PARALLAX ============
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  if (!reducedMotion && hasFinePointer) {
    let rafId = null;
    document.addEventListener("pointermove", (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const mx = (e.clientX / window.innerWidth - 0.5) * 24;
        const my = (e.clientY / window.innerHeight - 0.5) * 24;
        html.style.setProperty("--mx", mx.toFixed(2));
        html.style.setProperty("--my", my.toFixed(2));
        rafId = null;
      });
    });
  }

  // ============ ATMOSPHERE: SCROLL-REACTIVE RECTANGLE FIELD (GSAP) ============
  const rectField = document.getElementById("rect-field");
  if (rectField && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const RECT_COLORS = ["#3b82f6", "#f59e0b", "#3FCB93", "#6366f1", "#f97316", "#0ea5e9"];
    let rectTriggers = [];

    function buildRectField() {
      rectField.innerHTML = "";
      rectTriggers.forEach((t) => t.kill());
      rectTriggers = [];

      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 13 : 24;
      const cols = isMobile ? 4 : 7;

      for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.className = "rect";

        const col = i % cols;
        const colWidth = 100 / cols;
        const w = 46 + Math.random() * 150;
        const h = 120 + Math.random() * 320;
        const left = col * colWidth + Math.random() * (colWidth * 0.55) - 4;
        const top = Math.random() * 92;
        const startRadius = Math.random() > 0.5 ? "50%" : "6%";
        const endRadius = startRadius === "50%" ? "6%" : "50%";
        const color = RECT_COLORS[i % RECT_COLORS.length];
        const filled = Math.random() > 0.4;

        el.style.width = w + "px";
        el.style.height = h + "px";
        el.style.left = left + "%";
        el.style.top = top + "%";
        el.style.borderRadius = startRadius;
        if (filled) {
          el.style.background = `linear-gradient(150deg, ${color}, transparent)`;
          el.style.opacity = (0.24 + Math.random() * 0.22).toFixed(2);
          el.style.boxShadow = `0 0 60px 0 ${color}`;
        } else {
          el.style.border = `2px solid ${color}`;
          el.style.opacity = (0.4 + Math.random() * 0.3).toFixed(2);
        }

        rectField.appendChild(el);

        if (reducedMotion) continue;

        const direction = i % 2 === 0 ? -1 : 1;
        const travel = 220 + Math.random() * 420;
        const spin = direction * (70 + Math.random() * 160);
        const endScale = 0.7 + Math.random() * 0.75;

        const tween = gsap.to(el, {
          y: direction * travel,
          rotation: spin,
          scale: endScale,
          borderRadius: endRadius,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4 + Math.random() * 0.9
          }
        });
        rectTriggers.push(tween.scrollTrigger);

        gsap.to(el, {
          x: (Math.random() - 0.5) * 50,
          duration: 4 + Math.random() * 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 3
        });
      }
    }

    buildRectField();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildRectField, 300);
    });
  }

  // ============ NAV: SCROLL STATE, MOBILE MENU, ACTIVE LINK ============
  const navbar = document.getElementById("navbar");
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.querySelectorAll(".nav-links a");
  const scrollProgressBar = document.getElementById("scroll-progress");
  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (navbar && menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navbar.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navbar.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 767) {
        navbar.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function updateActiveNav() {
    const pos = window.scrollY + 140;
    let activeIndex = 0;
    sections.forEach((section, i) => {
      if (section.offsetTop <= pos) activeIndex = i;
    });
    navLinks.forEach((link, i) => link.classList.toggle("is-active", i === activeIndex));
  }

  window.addEventListener("scroll", () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollProgressBar) {
      const scrolled = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
      scrollProgressBar.style.width = scrolled + "%";
    }
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 40);
    updateActiveNav();
  }, { passive: true });
  updateActiveNav();

  // ============ REVEAL ON SCROLL ============
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  // ============ COUNT-UP STATS ============
  const statEls = document.querySelectorAll(".hero-stats strong[data-count]");
  if (statEls.length && "IntersectionObserver" in window) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const start = performance.now();
        function tick(now) {
          const p = Math.min(1, (now - start) / 800);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        statObserver.unobserve(el);
      });
    }, { threshold: 0.4 });
    statEls.forEach((el) => statObserver.observe(el));
  }

  // ============ FLOATING QUICK-CONTACT ============
  const floating = document.getElementById("floating-actions");
  const floatingToggle = document.getElementById("floating-toggle");
  const heroSection = document.getElementById("home");
  const contactSection = document.getElementById("contact");

  if (floating && floatingToggle) {
    floatingToggle.addEventListener("click", () => {
      const isOpen = floating.classList.toggle("is-open");
      floatingToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (e) => {
      if (!floating.contains(e.target)) {
        floating.classList.remove("is-open");
        floatingToggle.setAttribute("aria-expanded", "false");
      }
    });

    window.addEventListener("scroll", () => {
      const pastHero = !heroSection || heroSection.getBoundingClientRect().bottom < 0;
      const nearContact = contactSection && contactSection.getBoundingClientRect().top < window.innerHeight * 0.75;
      floating.classList.toggle("show", pastHero && !nearContact);
      if (nearContact) {
        floating.classList.remove("is-open");
        floatingToggle.setAttribute("aria-expanded", "false");
      }
    }, { passive: true });
  }

  // ============ RESUME DOWNLOAD ============
  const downloadButton = document.getElementById("download-resume-btn");
  if (downloadButton) {
    downloadButton.addEventListener("click", () => {
      const resumePath = "assets/CV_Aziz_Landoulsi.pdf";
      const link = document.createElement("a");
      link.href = resumePath;
      link.download = "Aziz_Landoulsi_Resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // ============ EMAILJS CONTACT FORM ============
  const EMAILJS_CONFIG = {
    serviceID: "service_gq3hp0k",
    ownerTemplateID: "template_ed4c6c8",
    autoReplyTemplateID: "template_q1xol7s",
    publicKey: "mui0mwDyvCW_2sNBT"
  };

  emailjs.init(EMAILJS_CONFIG.publicKey);

  const contactForm = document.getElementById("contact-form");
  const formFeedback = document.getElementById("form-feedback");
  if (!contactForm || !formFeedback) return;

  const submitButton = contactForm.querySelector(".btn-submit");
  const nameInput = document.getElementById("full-name");
  const emailInput = document.getElementById("email");
  const subjectSelect = document.getElementById("subject");
  const messageInput = document.getElementById("message");
  if (!submitButton) return;

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const visitorEmail = (emailInput?.value || "").trim();
    const visitorMessage = (messageInput?.value || "").trim();
    const subjectKey = subjectSelect?.value || "other";
    const subjectLabel = STRINGS[currentLang].subjectLabel[subjectKey] || subjectKey;

    const templateParams = {
      name: (nameInput?.value || "").trim(),
      email: visitorEmail,
      user_email: visitorEmail,
      title: `Portfolio : ${subjectLabel}`,
      phone: "",
      message: visitorMessage
    };

    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.classList.add("loading");
    submitButton.innerHTML = `<span class="loader"></span>${STRINGS[currentLang].formSending}`;
    formFeedback.className = "form-feedback";
    formFeedback.textContent = "";
    formFeedback.style.display = "none";

    const showSuccess = () => {
      formFeedback.className = "form-feedback success";
      formFeedback.innerHTML = STRINGS[currentLang].formSuccess;
      formFeedback.style.display = "block";
      formFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
      contactForm.reset();
    };

    emailjs.send(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.ownerTemplateID, templateParams)
      .then(() => emailjs.send(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.autoReplyTemplateID, templateParams)
        .then(showSuccess)
        .catch(showSuccess))
      .catch((error) => {
        console.error("EmailJS Error:", error);
        formFeedback.className = "form-feedback error";
        formFeedback.innerHTML = STRINGS[currentLang].formError;
        formFeedback.style.display = "block";
        formFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.classList.remove("loading");
        submitButton.innerHTML = originalText;
      });
  });
});
