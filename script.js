// script.js - full site interactions
document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     Mobile menu + overlay
     ========================= */
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  let overlay = document.querySelector(".overlay");

  // create overlay if not present
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "overlay";
    document.body.appendChild(overlay);
  }

  const openMenu = () => {
    if (navLinks) navLinks.classList.add("active");
    if (hamburger) hamburger.classList.add("active");
    overlay.style.display = "block";
    document.body.style.overflow = "hidden"; // prevent body scroll when menu open
  };

  const closeMenu = () => {
    if (navLinks) navLinks.classList.remove("active");
    if (hamburger) hamburger.classList.remove("active");
    overlay.style.display = "none";
    document.body.style.overflow = ""; // restore scrolling
  };

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      if (navLinks && navLinks.classList.contains("active")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  overlay.addEventListener("click", closeMenu);

  // Auto-close when clicking any nav link (mobile)
  document.querySelectorAll(".nav-links a").forEach(a => {
    a.addEventListener("click", () => {
      // if the link is an internal anchor and points to a section on the same page, smooth scroll will handle it
      closeMenu();
    });
  });

  /* =========================
     Dark mode toggle (localStorage)
     ========================= */
  const themeToggle = document.getElementById("theme-toggle");
  const THEME_KEY = "site-theme"; // 'dark' or 'light'

  const applyTheme = (theme) => {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      if (themeToggle) themeToggle.checked = true;
    } else {
      document.body.classList.remove("dark-mode");
      if (themeToggle) themeToggle.checked = false;
    }
  };

  // initialize from storage (if any)
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark") applyTheme("dark");
  else applyTheme("light");

  if (themeToggle) {
    themeToggle.addEventListener("change", () => {
      const isDark = document.body.classList.toggle("dark-mode");
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    });
  }

  /* =========================
     Typing effect (home page)
     - element: id="typing-text"
     - optional: data-phrases='["A","B"]' (JSON)
     ========================= */
  const typingEl = document.getElementById("typing-text");
  if (typingEl) {
    let phrases = ["We Fund.", "You Trade.", "We Grow Together."];
    const data = typingEl.getAttribute("data-phrases");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length) phrases = parsed;
      } catch (e) { /* ignore parse errors and use default */ }
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeSpeed = 80;
    const deleteSpeed = 50;
    const delayBetween = 1400;

    const tick = () => {
      const current = phrases[phraseIndex];
      if (!isDeleting) {
        typingEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(tick, delayBetween);
          return;
        }
      } else {
        typingEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
      setTimeout(tick, isDeleting ? deleteSpeed : typeSpeed);
    };

    tick();
  }

  /* =========================
     Fade-in on scroll (IntersectionObserver)
     - elements: .fade-in
     Adds .appear when visible
     ========================= */
  const faders = document.querySelectorAll(".fade-in");
  if ("IntersectionObserver" in window && faders.length) {
    const appearOptions = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("appear");
        observer.unobserve(entry.target);
      });
    }, appearOptions);
    faders.forEach(f => appearOnScroll.observe(f));
  } else {
    // fallback: reveal immediately
    faders.forEach(f => f.classList.add("appear"));
  }

  /* =========================
     Stats counters - animate when #stats visible
     - elements: .counter with data-target attribute
     ========================= */
  const counters = document.querySelectorAll(".counter");
  const statsSection = document.getElementById("stats");
  if (statsSection && counters.length && "IntersectionObserver" in window) {
    let played = false;
    const statsObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !played) {
          // animate each counter
          counters.forEach(counter => {
            const target = parseInt(counter.getAttribute("data-target"), 10) || 0;
            const duration = 1500; // ms
            const frameRate = 30; // updates per second
            const totalFrames = Math.round(duration / (1000 / frameRate));
            let frame = 0;
            const countFrom = 0;
            const counterTimer = setInterval(() => {
              frame++;
              const progress = frame / totalFrames;
              const eased = easeOutCubic(progress);
              const value = Math.round(countFrom + (target - countFrom) * eased);
              counter.textContent = value.toLocaleString();
              if (frame >= totalFrames) {
                clearInterval(counterTimer);
                counter.textContent = target.toLocaleString();
              }
            }, Math.round(1000 / frameRate));
          });
          played = true;
        }
      });
    }, { threshold: 0.4 });
    statsObs.observe(statsSection);
  }

  function easeOutCubic(t) {
    return (--t) * t * t + 1;
  }

  /* =========================
     Smooth scroll for same-page anchor links
     - anchor links starting with #
     ========================= */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // Close mobile menu if open
        closeMenu();
      }
    });
  });

  /* =========================
     Demo contact form handler (prevents real submit)
     - keeps UX on static sites
     ========================= */
  const contactForm = document.querySelector("form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Simple validation (name & email)
      const name = contactForm.querySelector('input[type="text"], input[name="name"]');
      const email = contactForm.querySelector('input[type="email"], input[name="email"]');
      if (name && name.value.trim() === "") {
        alert("Please enter your name.");
        name.focus();
        return;
      }
      if (email && email.value.trim() === "") {
        alert("Please enter your email.");
        email.focus();
        return;
      }
      // success message (replace with form endpoint if available)
      alert("Thank you! Your message has been received. We'll contact you shortly.");
      contactForm.reset();
    });
  }

  /* =========================
     Accessibility: close menu on ESC
     ========================= */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  /* =========================
     Ensure nav state on resize (if desktop, remove mobile overlay)
     ========================= */
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      // ensure menu closed and overlay removed on desktop
      closeMenu();
    }
  });
});
