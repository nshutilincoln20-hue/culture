// ============================================================
// __CULTURE.__  —  site logic
// Note: product listing, cart, and checkout are now handled by the
// Shopify Buy Button embed at the bottom of index.html — not by this file.
// ============================================================

// ---------- toast notifications ----------
const toastContainer = document.getElementById("toastContainer");

function showToast(message, type = "default") {
  const toast = document.createElement("div");
  toast.className = `toast${type === "error" ? " toast-error" : ""}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-out");
    toast.addEventListener("animationend", () => toast.remove());
  }, 2600);
}

// ---------- image load handling (real skeleton removal, not a fake timer) ----------
function wireImageLoad(imgEl) {
  const markLoaded = () => imgEl.classList.add("loaded");
  if (imgEl.complete && imgEl.naturalWidth > 0) {
    markLoaded();
  } else {
    imgEl.addEventListener("load", markLoaded);
    imgEl.addEventListener("error", markLoaded);
  }
}
function wireAllImages(container) {
  container.querySelectorAll("img").forEach(wireImageLoad);
}

function lockScroll(lock) {
  document.body.classList.toggle("locked", lock);
}

wireAllImages(document.querySelector(".campaign"));

// ---------- campaign hero: interactive tilt on desktop ----------
const campaignWrap = document.getElementById("campaignImgWrap");
const campaignImg = campaignWrap.querySelector("img");
const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (supportsHover) {
  campaignWrap.addEventListener("mousemove", e => {
    const rect = campaignWrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = x * 14;
    const rotateX = y * -14;
    campaignWrap.classList.add("tilting");
    campaignImg.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
  });
  campaignWrap.addEventListener("mouseleave", () => {
    campaignWrap.classList.remove("tilting");
    campaignImg.style.transform = "";
  });
}
campaignWrap.addEventListener("click", () => openLightbox(campaignImg.src, campaignImg.alt));

// ---------- lightbox (used for the hero graphic) ----------
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.classList.add("open");
  lockScroll(true);
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lockScroll(false);
}
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

// ---------- nav / scroll-to-shop ----------
document.getElementById("navHome").addEventListener("click", e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
document.getElementById("shopNowBtn").addEventListener("click", () => {
  document.getElementById("collectionBanner").scrollIntoView({ behavior: "smooth" });
});

// ---------- mobile menu ----------
const mobileMenu = document.getElementById("mobileMenu");
document.getElementById("menuBtn").addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});
mobileMenu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => mobileMenu.classList.remove("open"));
});

// ---------- newsletter ----------
document.getElementById("newsletterForm").addEventListener("submit", e => {
  e.preventDefault();
  const input = e.target.querySelector("input");
  showToast(`Subscribed! We'll email ${input.value}`);
  input.value = "";
});

// ---------- nav scroll shadow ----------
const navWrap = document.getElementById("navWrap");
window.addEventListener("scroll", () => {
  navWrap.classList.toggle("scrolled", window.scrollY > 8);
}, { passive: true });

// ---------- page loader ----------
// Shows the logo, holds a beat, then dissolves slowly to reveal the site.
const pageLoader = document.getElementById("pageLoader");
lockScroll(true);
window.addEventListener("load", () => {
  setTimeout(() => {
    pageLoader.classList.add("hide");
    lockScroll(false);
    setTimeout(() => pageLoader.remove(), 1200);
  }, 1400);
});
