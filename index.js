document.addEventListener("DOMContentLoaded", () => {
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
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
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
        formFeedback.textContent = "✓ Message sent successfully!";
        formFeedback.style.display = "block";
        contactForm.reset();
      })
      .catch(() => {
        // Owner notification succeeded; auto-reply failed
        formFeedback.className = "form-feedback success";
        formFeedback.textContent = "✓ Message sent successfully!";
        formFeedback.style.display = "block";
        contactForm.reset();
      });
    })
    .catch((error) => {
      console.error("EmailJS Error:", error);
      formFeedback.className = "form-feedback error";
      formFeedback.textContent = "✗ Failed to send message. Please try again.";
      formFeedback.style.display = "block";
    })
    .finally(() => {
      // Re-enable button
      submitButton.disabled = false;
      submitButton.textContent = "Submit now";
    });
  });
});
