// ============================================================
// __CULTURE.__  —  storefront logic (custom demo shop, no external Shopify script)
// ============================================================

const PRODUCTS = [
  {
    id: "street-love-god",
    name: "STREET LOVE GOD TEE",
    price: 30,
    image: "assets/tee-make-street-love-god.jpg",
    description: "Black heavyweight cotton tee. Front features 'MAKE THE STREET LOVE GOD' in a bold circular badge. Back features 'MY IDENTITY IN CHRIST' in red vertical type."
  },
  {
    id: "goat",
    name: "GOAT TEE",
    price: 30,
    image: "assets/tee-goat.jpg",
    description: "Black heavyweight cotton tee. Front features the CULTURE oval logo in white. Back features 'GOAT' with 'GOD OVER ALL THINGS' and a cross with candle in tan."
  },
  {
    id: "way-truth-life",
    name: "WAY TRUTH LIFE TEE",
    price: 30,
    image: "assets/tee-way-truth-life.jpg",
    description: "White heavyweight cotton tee. Front features the CULTURE wordmark in periwinkle blue. Back features 'WAY TRUTH LIFE' stacked with 'JESUS' at center in navy."
  },
  {
    id: "make-heaven-crowded",
    name: "MAKE HEAVEN CROWDED TEE",
    price: 30,
    image: "assets/tee-make-heaven-crowded.jpg",
    description: "White heavyweight cotton tee. Front features the CULTURE oval logo in blue and pink. Back features 'MAKE HEAVEN CROWDED' with a circle of figures holding hands in royal blue."
  },
  {
    id: "call-on-jesus",
    name: "CALL ON JESUS TEE",
    price: 30,
    image: "assets/tee-call-on-jesus.jpg",
    description: "White heavyweight cotton tee. Front features 'CALL ON JESUS' with stars and a flip phone graphic. Back features the CULTURE oval logo in pink and blue."
  },
  {
    id: "blessed-by-lord",
    name: "BLESSED BY THE LORD TEE",
    price: 30,
    image: "assets/tee-blessed-by-lord.jpg",
    description: "Black heavyweight cotton tee. Front features the CULTURE oval logo in white. Back features a cross above 'BLESSED BY THE LORD'."
  },
  {
    id: "god-bigger-fear",
    name: "GOD IS BIGGER THAN YOUR FEAR TEE",
    price: 30,
    image: "assets/tee-god-bigger-fear.jpg",
    description: "White heavyweight cotton tee. Front features the CULTURE oval logo in black. Back features 'GOD IS BIGGER THAN YOUR FEAR' with a star, in pink and black script."
  },
  {
    id: "trust-in-lord",
    name: "TRUST IN THE LORD TEE",
    price: 30,
    image: "assets/tee-trust-in-lord.jpg",
    description: "Black heavyweight cotton tee. Front features a hand-drawn cross. Back features the CULTURE oval logo above 'TRUST IN THE LORD' in bold distressed type."
  }
];

const SIZES = ["XS", "S", "M", "L", "XL"];

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

// ---------- image load handling ----------
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

// ---------- scroll reveal ----------
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

function wireReveal(container) {
  container.querySelectorAll(".product-card").forEach((card, i) => {
    card.style.transitionDelay = `${(i % 4) * 60}ms`;
    revealObserver.observe(card);
  });
}

// ---------- page elements ----------
const pageHome = document.getElementById("page-home");
const pageProduct = document.getElementById("page-product");
const pageCheckout = document.getElementById("page-checkout");
const pageConfirmation = document.getElementById("page-confirmation");
const ALL_PAGES = [pageHome, pageProduct, pageCheckout, pageConfirmation];

function showPage(page) {
  ALL_PAGES.forEach(p => (p.hidden = true));
  page.hidden = false;
  window.scrollTo(0, 0);
}

function lockScroll(lock) {
  document.body.classList.toggle("locked", lock);
}

// ---------- wishlist ----------
let wishlist = new Set();
const wishlistBadge = document.getElementById("wishlistBadge");

function toggleWishlist(id, product, heartBtn) {
  if (wishlist.has(id)) {
    wishlist.delete(id);
    heartBtn.classList.remove("active");
    showToast(`Removed ${product.name} from wishlist`);
  } else {
    wishlist.add(id);
    heartBtn.classList.add("active");
    showToast(`${product.name} added to wishlist`);
  }
  wishlistBadge.hidden = wishlist.size === 0;
  wishlistBadge.textContent = wishlist.size;
}

// ---------- product grid ----------
const grid = document.getElementById("productGrid");
const heartIcon = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`;

grid.innerHTML = PRODUCTS.map(p => `
  <div class="product-card" data-id="${p.id}">
    <div class="product-card-img-wrap">
      <button class="wishlist-heart" data-wishlist="${p.id}" aria-label="Add to wishlist">${heartIcon}</button>
      <img src="${p.image}" alt="${p.name}">
    </div>
    <h3>${p.name}</h3>
    <span class="price">$${p.price.toFixed(2)} USD</span>
  </div>
`).join("");

wireAllImages(grid);
wireReveal(grid);

grid.addEventListener("click", e => {
  const heartBtn = e.target.closest("[data-wishlist]");
  if (heartBtn) {
    e.stopPropagation();
    const product = PRODUCTS.find(p => p.id === heartBtn.dataset.wishlist);
    toggleWishlist(heartBtn.dataset.wishlist, product, heartBtn);
    return;
  }
  const card = e.target.closest(".product-card");
  if (card) openProduct(card.dataset.id);
});

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

// ---------- lightbox ----------
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

// ---------- product detail ----------
let selectedSize = "M";
const detailEl = document.getElementById("productDetail");

function openProduct(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  selectedSize = "M";
  renderProduct(product);
  showPage(pageProduct);
}

function renderProduct(product) {
  const isWishlisted = wishlist.has(product.id);
  detailEl.innerHTML = `
    <div class="detail-media">
      <div class="product-detail-img-wrap" id="detailImgWrap">
        <button class="wishlist-heart ${isWishlisted ? "active" : ""}" data-wishlist="${product.id}" aria-label="Add to wishlist">${heartIcon}</button>
        <img src="${product.image}" alt="${product.name}">
        <span class="zoom-hint">Click to zoom</span>
      </div>
    </div>
    <div class="detail-info">
      <h1>${product.name}</h1>
      <p class="price">$${product.price.toFixed(2)} USD</p>
      <hr>
      <p class="description">${product.description}</p>
      <p class="fabric-note">100% Heavyweight Cotton, 240 GSM</p>
      <p class="size-label">Select Size</p>
      <div class="size-options" id="sizeOptions">
        ${SIZES.map(s => `<button class="size-btn ${s === selectedSize ? "selected" : ""}" data-size="${s}">${s}</button>`).join("")}
      </div>
      <button class="add-cart-btn" id="addCartBtn">ADD TO CART — $${product.price.toFixed(2)}</button>
      <div class="trust-badges">
        <div class="trust-badge">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
          <span>Secure Checkout</span>
        </div>
        <div class="trust-badge">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="17.5" cy="18" r="1.5"/></svg>
          <span>Free Shipping $100+</span>
        </div>
        <div class="trust-badge">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4v6h6"/><path d="M4.5 15a8 8 0 1 0 2-9.5L4 10"/></svg>
          <span>30-Day Returns</span>
        </div>
      </div>
    </div>
  `;

  wireAllImages(detailEl);

  document.getElementById("detailImgWrap").addEventListener("click", e => {
    if (e.target.closest("[data-wishlist]")) return;
    openLightbox(product.image, product.name);
  });

  detailEl.querySelector("[data-wishlist]").addEventListener("click", e => {
    e.stopPropagation();
    toggleWishlist(product.id, product, e.currentTarget);
  });

  document.getElementById("sizeOptions").addEventListener("click", e => {
    const btn = e.target.closest(".size-btn");
    if (!btn) return;
    selectedSize = btn.dataset.size;
    detailEl.querySelectorAll(".size-btn").forEach(b => b.classList.toggle("selected", b === btn));
  });

  const addBtn = document.getElementById("addCartBtn");
  addBtn.addEventListener("click", () => {
    addToCart(product, selectedSize);
    addBtn.textContent = "ADDED ✓";
    addBtn.classList.add("added");
    setTimeout(() => {
      addBtn.textContent = `ADD TO CART — $${product.price.toFixed(2)}`;
      addBtn.classList.remove("added");
    }, 900);
    showToast(`${product.name} (${selectedSize}) added to cart`);
    openCart();
  });
}

document.getElementById("backToHome").addEventListener("click", () => showPage(pageHome));
document.getElementById("backFromCheckout").addEventListener("click", () => showPage(pageHome));
document.getElementById("navHome").addEventListener("click", e => { e.preventDefault(); showPage(pageHome); });
document.getElementById("shopNowBtn").addEventListener("click", () => {
  showPage(pageHome);
  document.getElementById("collectionBanner").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("wishlistBtn").addEventListener("click", () => {
  if (wishlist.size === 0) {
    showToast("Your wishlist is empty");
  } else {
    showToast(`${wishlist.size} item${wishlist.size > 1 ? "s" : ""} in your wishlist`);
  }
});

// ---------- mobile menu ----------
const mobileMenu = document.getElementById("mobileMenu");
document.getElementById("menuBtn").addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});
[["menuAll", pageHome], ["menuNew", pageHome], ["menuBest", pageHome]].forEach(([id, page]) => {
  document.getElementById(id).addEventListener("click", e => {
    e.preventDefault();
    mobileMenu.classList.remove("open");
    showPage(page);
  });
});

// ---------- cart state ----------
let cart = [];

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItemsEl = document.getElementById("cartItems");
const cartHeading = document.getElementById("cartHeading");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const cartBadge = document.getElementById("cartBadge");
const cartCheckoutBtn = document.getElementById("cartCheckoutBtn");

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  lockScroll(true);
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
  lockScroll(false);
}

function addToCart(product, size) {
  const existing = cart.find(item => item.id === product.id && item.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, size, qty: 1 });
  }
  renderCart();
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
}

function removeItem(index) {
  const removed = cart[index];
  cart.splice(index, 1);
  renderCart();
  if (removed) showToast(`Removed ${removed.name}`);
}

function renderCart() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartHeading.textContent = `CART (${totalQty})`;

  if (totalQty > 0) {
    cartBadge.hidden = false;
    cartBadge.textContent = totalQty;
    cartBadge.classList.remove("pulse");
    void cartBadge.offsetWidth;
    cartBadge.classList.add("pulse");
  } else {
    cartBadge.hidden = true;
  }

  cartCheckoutBtn.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
  } else {
    cartItemsEl.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <div class="thumb-wrap"><img src="${item.image}" alt="${item.name}"></div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p class="cart-item-size">Size: ${item.size}</p>
          <div class="qty-stepper">
            <button data-qty-down="${i}">−</button>
            <span>${item.qty}</span>
            <button data-qty-up="${i}">+</button>
          </div>
        </div>
        <div>
          <p class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</p>
          <button class="cart-item-remove" data-remove="${i}">REMOVE</button>
        </div>
      </div>
    `).join("");
    wireAllImages(cartItemsEl);
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartSubtotalEl.textContent = `$${total.toFixed(2)}`;
}

cartItemsEl.addEventListener("click", e => {
  const upBtn = e.target.closest("[data-qty-up]");
  const downBtn = e.target.closest("[data-qty-down]");
  const removeBtn = e.target.closest("[data-remove]");
  if (upBtn) changeQty(Number(upBtn.dataset.qtyUp), 1);
  if (downBtn) changeQty(Number(downBtn.dataset.qtyDown), -1);
  if (removeBtn) removeItem(Number(removeBtn.dataset.remove));
});

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });

cartCheckoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;
  closeCart();
  showPage(pageCheckout);
});

// ---------- checkout ----------
document.getElementById("placeOrderBtn").addEventListener("click", e => {
  e.preventDefault();
  const inputs = pageCheckout.querySelectorAll("input[required]");
  let allFilled = true;
  inputs.forEach(input => {
    if (!input.value.trim()) {
      allFilled = false;
      input.style.borderColor = "#c62828";
    } else {
      input.style.borderColor = "";
    }
  });

  if (!allFilled) {
    showToast("Please fill in all required fields", "error");
    return;
  }

  renderConfirmation();
  cart = [];
  renderCart();
  showPage(pageConfirmation);
});

function renderConfirmation() {
  const orderNumber = "CUL-" + Math.floor(100000 + Math.random() * 900000);
  document.getElementById("confirmOrderNumber").textContent = `Order #${orderNumber}`;

  const summaryEl = document.getElementById("confirmSummary");
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  summaryEl.innerHTML = cart.map(item => `
    <div class="confirmation-item">
      <span>${item.name} (${item.size}) × ${item.qty}</span>
      <span>$${(item.price * item.qty).toFixed(2)}</span>
    </div>
  `).join("") + `
    <div class="confirmation-total">
      <span>Total</span>
      <span>$${total.toFixed(2)}</span>
    </div>
  `;
}

document.getElementById("continueShoppingBtn").addEventListener("click", () => {
  showPage(pageHome);
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
const pageLoader = document.getElementById("pageLoader");
lockScroll(true);
window.addEventListener("load", () => {
  setTimeout(() => {
    pageLoader.classList.add("hide");
    lockScroll(false);
    setTimeout(() => pageLoader.remove(), 1200);
  }, 1400);
});

renderCart();
