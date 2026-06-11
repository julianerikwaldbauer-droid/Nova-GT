const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("[data-scroll]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    if (!id || !id.startsWith("#")) return;

    const target = document.querySelector(id);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  });
});

const counterItems = document.querySelectorAll("[data-counter]");
let heroCountersReady = false;
const easeOutQuint = (value) => 1 - Math.pow(1 - value, 5);

const formatCounterValue = (value, decimals) => {
  if (decimals > 0) return value.toFixed(decimals);
  return Math.round(value).toString();
};

const animateCounter = (element) => {
  if (element.dataset.animated === "true") return true;
  if (element.closest(".hero-stats") && !heroCountersReady) return false;

  const target = Number(element.dataset.counter || 0);
  const decimals = Number(element.dataset.decimals || 0);
  const duration = Number(element.dataset.duration || 1700);

  if (!Number.isFinite(target)) return false;

  element.dataset.animated = "true";

  if (prefersReducedMotion) {
    element.textContent = formatCounterValue(target, decimals);
    return true;
  }

  let startTime;

  const frame = (time) => {
    if (!startTime) startTime = time;

    const progress = Math.min((time - startTime) / duration, 1);
    const currentValue = target * easeOutQuint(progress);

    element.textContent = formatCounterValue(currentValue, decimals);

    if (progress < 1) {
      requestAnimationFrame(frame);
      return;
    }

    element.textContent = formatCounterValue(target, decimals);
  };

  requestAnimationFrame(frame);
  return true;
};

const isInViewport = (element, offset = 0.92) => {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * offset && rect.bottom > 0;
};

const triggerVisibleCounters = () => {
  counterItems.forEach((item) => {
    if (isInViewport(item)) animateCounter(item);
  });
};

const setLoadedState = () => {
  requestAnimationFrame(() => {
    document.body.classList.add("is-loaded");
  });

  window.setTimeout(() => {
    heroCountersReady = true;
    document.querySelectorAll(".hero-stats [data-counter]").forEach(animateCounter);
    triggerVisibleCounters();
  }, prefersReducedMotion ? 0 : 1700);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setLoadedState, { once: true });
} else {
  setLoadedState();
}

const revealItems = document.querySelectorAll([
  ".section",
  ".section-heading",
  ".design-copy",
  ".design-notes article",
  ".design-tech-card",
  ".large-image",
  ".engineering-heading",
  ".detail-image",
  ".engineering-note",
  ".cockpit-frame",
  ".stat-grid article",
  ".micro-specs article",
  ".tech-callout",
  ".power-map",
  ".powertrain-copy",
  ".modes-heading",
  ".mode-grid article",
  ".motion-breaker",
  ".interior-panel > div",
  ".gallery h2",
  ".gallery-feature",
  ".gallery-stack figure",
  ".request-form"
].join(","));

revealItems.forEach((item) => item.classList.add("reveal"));

document.querySelectorAll(".mode-card").forEach((card) => {
  const activateCard = () => {
    card.parentElement?.querySelectorAll(".mode-card").forEach((item) => {
      item.classList.toggle("is-active", item === card);
    });
  };

  card.addEventListener("mouseenter", activateCard);
  card.addEventListener("focusin", activateCard);
  card.addEventListener("click", activateCard);
});

document.querySelectorAll(".gallery img, .marquee-gallery img").forEach((image) => {
  image.draggable = false;
  image.addEventListener("dragstart", (event) => event.preventDefault());
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -8% 0px"
  });

  revealItems.forEach((item) => revealObserver.observe(item));

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      if (animateCounter(entry.target)) counterObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.35,
    rootMargin: "0px 0px -10% 0px"
  });

  counterItems.forEach((item) => counterObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
  triggerVisibleCounters();
}

const inquiryForm = document.querySelector(".request-form");
const inquiryLink = document.querySelector(".submit-link");

if (inquiryForm && inquiryLink) {
  inquiryLink.addEventListener("click", () => {
    const data = new FormData(inquiryForm);
    const body = [
      `Name: ${data.get("name") || ""}`,
      `Email: ${data.get("email") || ""}`,
      `Project type: ${data.get("type") || ""}`,
      "",
      data.get("message") || ""
    ].join("\n");

    inquiryLink.href = `mailto:contact@studionull.design?subject=NOVA%20GT%20Digital%20Campaign%20Inquiry&body=${encodeURIComponent(body)}`;
  });
}

window.addEventListener("load", () => {
  requestAnimationFrame(triggerVisibleCounters);
  revealItems.forEach((item) => {
    if (isInViewport(item, 1)) item.classList.add("visible");
  });
});

window.addEventListener("scroll", triggerVisibleCounters, { passive: true });
window.addEventListener("resize", triggerVisibleCounters);
triggerVisibleCounters();
