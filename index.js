document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.querySelectorAll(".contact a");
  const scrollProgressBar = document.getElementById("scroll-progress");
  const floatingActions = document.getElementById("floating-actions");
  const floatToggle = document.getElementById("float-toggle");
  const stickyCta = document.getElementById("sticky-cta");
  const contactSection = document.getElementById("contact");

  // ============ FLOATING ACTIONS TOGGLE ============
  if (floatToggle && floatingActions) {
    floatToggle.addEventListener("click", () => {
      const isOpen = floatingActions.classList.toggle("show");
      floatToggle.classList.toggle("active", isOpen);
      floatToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu when clicking on an action link
    floatingActions.querySelectorAll(".float-action").forEach((link) => {
      link.addEventListener("click", () => {
        floatingActions.classList.remove("show");
        floatToggle.classList.remove("active");
        floatToggle.setAttribute("aria-expanded", "false");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !floatToggle.contains(e.target) &&
        !floatingActions.contains(e.target)
      ) {
        floatingActions.classList.remove("show");
        floatToggle.classList.remove("active");
        floatToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ============ SCROLL PROGRESS BAR ============
  window.addEventListener("scroll", () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / scrollHeight) * 100;
    if (scrollProgressBar) {
      scrollProgressBar.style.width = scrolled + "%";
    }

    // ============ NAVBAR SCROLL STATE (DARKER) ============
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }

    // ============ STICKY CTA VISIBILITY (ALWAYS ON, HIDE AT CONTACT) ============
    if (stickyCta && contactSection) {
      const contactRect = contactSection.getBoundingClientRect();
      const isContactVisible = contactRect.top < window.innerHeight * 0.7;

      // Hide sticky CTA when contact section is visible
      if (isContactVisible) {
        stickyCta.classList.remove("show");
      } else {
        stickyCta.classList.add("show");
      }
    }
  });

  // ============ INITIALIZE STICKY CTA VISIBLE ============
  if (stickyCta) {
    stickyCta.classList.add("show");
  }

  // ============ STICKY CTA ANCHOR CLICK ============
  if (stickyCta) {
    stickyCta.addEventListener("click", () => {
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
        const formInput = document.getElementById("first-name");
        if (formInput) setTimeout(() => formInput.focus(), 500);
      }
    });

    // Hide sticky CTA on click (optional - auto-hide after navigation)
    stickyCta.addEventListener("click", () => {
      stickyCta.classList.remove("show");
    });
  }

  // ============ HAMBURGER MENU TOGGLE ============
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

  // Resume Download Functionality
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

  // EmailJS Configuration
  // IMPORTANT: Replace these with your actual EmailJS credentials
  const EMAILJS_CONFIG = {
    serviceID: "service_gq3hp0k",      // Replace with your Service ID
    ownerTemplateID: "template_ed4c6c8",    // Template that sends the visitor message to you
    autoReplyTemplateID: "template_q1xol7s", // Template that sends confirmation to the visitor
    publicKey: "mui0mwDyvCW_2sNBT"       // Replace with your Public Key
  };

  // Initialize EmailJS
  emailjs.init(EMAILJS_CONFIG.publicKey);

  // Contact Form Functionality
  const contactForm = document.getElementById("contact-form");
  const formFeedback = document.getElementById("form-feedback");

  if (!contactForm || !formFeedback) {
    return;
  }

  const submitButton = contactForm.querySelector(".btn-submit");
  const firstNameInput = document.getElementById("first-name");
  const lastNameInput = document.getElementById("last-name");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");

  if (!submitButton) {
    return;
  }

  // ============ ENHANCED FORM SUBMISSION ============
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = `${firstNameInput?.value || ""} ${lastNameInput?.value || ""}`.trim();
    const visitorEmail = (emailInput?.value || "").trim();
    const visitorMessage = (messageInput?.value || "").trim();

    const templateParams = {
      name: fullName,
      email: visitorEmail,
      user_email: visitorEmail,
      title: "Portfolio contact message",
      phone: (document.getElementById("phone")?.value || "").trim(),
      message: visitorMessage
    };

    // Disable button and show loading state
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.classList.add("loading");
    submitButton.innerHTML = '<span class="loader"></span>Sending...';
    formFeedback.className = "form-feedback";
    formFeedback.textContent = "";
    formFeedback.style.display = "none";

    // Send owner notification
    emailjs.send(
      EMAILJS_CONFIG.serviceID,
      EMAILJS_CONFIG.ownerTemplateID,
      templateParams
    )
    .then(() => {
      // Send auto-reply in second step
      return emailjs.send(
        EMAILJS_CONFIG.serviceID,
        EMAILJS_CONFIG.autoReplyTemplateID,
        templateParams
      )
      .then(() => {
        formFeedback.className = "form-feedback success";
        formFeedback.innerHTML = '✓ Message sent successfully!';
        formFeedback.style.display = "block";
        formFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
        contactForm.reset();
      })
      .catch(() => {
        // Owner notification succeeded; auto-reply failed
        formFeedback.className = "form-feedback success";
        formFeedback.innerHTML = '✓ Message sent successfully!';
        formFeedback.style.display = "block";
        formFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
        contactForm.reset();
      });
    })
    .catch((error) => {
      console.error("EmailJS Error:", error);
      formFeedback.className = "form-feedback error";
      formFeedback.innerHTML = '✗ Failed to send message. Please try again.';
      formFeedback.style.display = "block";
      formFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
    })
    .finally(() => {
      // Re-enable button
      submitButton.disabled = false;
      submitButton.classList.remove("loading");
      submitButton.innerHTML = originalText;
    });
  });
});
