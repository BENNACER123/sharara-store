// =========================================================
// مراجع العناصر (DOM references)
// =========================================================
const productsGrid = document.getElementById("products-grid");
const skeletonGrid = document.getElementById("skeleton-grid");
const errorMessage = document.getElementById("error-message");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const minPriceInput = document.getElementById("min-price");
const maxPriceInput = document.getElementById("max-price");
const categoryFiltersEl = document.getElementById("category-filters");
const loadMoreBtn = document.getElementById("load-more-btn");
const bestSellersGrid = document.getElementById("best-sellers-grid");
const productCardTemplate = document.getElementById("product-card-template");

const themeToggleBtn = document.getElementById("theme-toggle");

const cartToggleBtn = document.getElementById("cart-toggle");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const cartCloseBtn = document.getElementById("cart-close");
const cartItemsList = document.getElementById("cart-items");
const cartItemTemplate = document.getElementById("cart-item-template");
const cartCountBadge = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const cartEmptyMessage = document.getElementById("cart-empty-message");
const checkoutBtn = document.getElementById("checkout-btn");

const wishlistToggleBtn = document.getElementById("wishlist-toggle");
const wishlistDrawer = document.getElementById("wishlist-drawer");
const wishlistOverlay = document.getElementById("wishlist-overlay");
const wishlistCloseBtn = document.getElementById("wishlist-close");
const wishlistItemsList = document.getElementById("wishlist-items");
const wishlistItemTemplate = document.getElementById("wishlist-item-template");
const wishlistCountBadge = document.getElementById("wishlist-count");
const wishlistEmptyMessage = document.getElementById("wishlist-empty-message");

const productModalOverlay = document.getElementById("product-modal-overlay");
const productModal = document.getElementById("product-modal");
const productModalClose = document.getElementById("product-modal-close");
const modalMainImage = document.getElementById("modal-main-image");
const modalThumbnails = document.getElementById("modal-thumbnails");
const modalCategory = document.getElementById("modal-category");
const modalTitle = document.getElementById("modal-title");
const modalRating = document.getElementById("modal-rating");
const modalDescription = document.getElementById("modal-description");
const modalOriginalPrice = document.getElementById("modal-original-price");
const modalPrice = document.getElementById("modal-price");
const modalAddToCart = document.getElementById("modal-add-to-cart");

const compareBar = document.getElementById("compare-bar");
const compareCountText = document.getElementById("compare-count-text");
const compareNowBtn = document.getElementById("compare-now-btn");
const compareClearBtn = document.getElementById("compare-clear-btn");
const compareModalOverlay = document.getElementById("compare-modal-overlay");
const compareModal = document.getElementById("compare-modal");
const compareModalClose = document.getElementById("compare-modal-close");
const compareTable = document.getElementById("compare-table");

const checkoutModalOverlay = document.getElementById("checkout-modal-overlay");
const checkoutModal = document.getElementById("checkout-modal");
const checkoutModalClose = document.getElementById("checkout-modal-close");
const checkoutForm = document.getElementById("checkout-form");
const checkoutSuccess = document.getElementById("checkout-success");

const toastContainer = document.getElementById("toast-container");

// =========================================================
// الحالة (State)
// =========================================================
const API_URL = "https://dummyjson.com/products?limit=100";
const PAGE_SIZE = 12;

let allProducts = [];
let cart = []; // { id, title, price, image, quantity }
let wishlist = []; // { id, title, price, image }
let compareList = []; // [id, id] (حد أقصى 2)

let currentSearchTerm = "";
let currentCategory = "all";
let currentSort = "default";
let currentMinPrice = null;
let currentMaxPrice = null;
let visibleCount = PAGE_SIZE;

const categoryLabels = {
  beauty: "مستحضرات تجميل",
  fragrances: "عطور",
  furniture: "أثاث",
  groceries: "بقالة",
  "home-decoration": "ديكور منزلي",
  "kitchen-accessories": "إكسسوارات مطبخ",
  laptops: "لابتوبات",
  "mens-shirts": "قمصان رجالية",
  "mens-shoes": "أحذية رجالية",
  "mens-watches": "ساعات رجالية",
  "mobile-accessories": "إكسسوارات موبايل",
  motorcycle: "دراجات نارية",
  "skin-care": "العناية بالبشرة",
  smartphones: "هواتف ذكية",
  "sports-accessories": "إكسسوارات رياضية",
  sunglasses: "نظارات شمسية",
  tablets: "أجهزة لوحية",
  tops: "ملابس علوية",
  vehicle: "مركبات",
  "womens-bags": "حقائب نسائية",
  "womens-dresses": "فساتين نسائية",
  "womens-jewellery": "مجوهرات نسائية",
  "womens-shoes": "أحذية نسائية",
  "womens-watches": "ساعات نسائية",
};

// =========================================================
// 1) جلب المنتجات من الـ API
// =========================================================
async function fetchProducts() {
  try {
    skeletonGrid.hidden = false;
    productsGrid.hidden = true;
    errorMessage.hidden = true;
    renderSkeletons(8);

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    allProducts = data.products;

    renderCategoryFilters();
    renderBestSellers();
    resetAndRefresh();
  } catch (error) {
    console.error("Fetch error:", error);
    errorMessage.hidden = false;
  } finally {
    skeletonGrid.hidden = true;
    productsGrid.hidden = false;
  }
}

function renderSkeletons(count) {
  skeletonGrid.replaceChildren();
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    `;
    skeletonGrid.appendChild(card);
  }
}

// =========================================================
// 2) فلترة الفئات
// =========================================================
function renderCategoryFilters() {
  const categories = ["all", ...new Set(allProducts.map((p) => p.category))];

  categoryFiltersEl.replaceChildren();

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "category-pill" + (cat === currentCategory ? " active" : "");
    btn.textContent = cat === "all" ? "الكل" : categoryLabels[cat] || cat;
    btn.dataset.category = cat;

    btn.addEventListener("click", () => {
      currentCategory = cat;

      categoryFiltersEl
        .querySelectorAll(".category-pill")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      resetAndRefresh();
    });

    categoryFiltersEl.appendChild(btn);
  });
}

// =========================================================
// 3) المنطق المشترك: بحث + فئة + سعر + ترتيب
// =========================================================
function getVisibleProducts() {
  let result = allProducts;

  if (currentCategory !== "all") {
    result = result.filter((p) => p.category === currentCategory);
  }

  if (currentSearchTerm) {
    result = result.filter((p) =>
      p.title.toLowerCase().includes(currentSearchTerm),
    );
  }

  if (currentMinPrice !== null) {
    result = result.filter((p) => p.price >= currentMinPrice);
  }

  if (currentMaxPrice !== null) {
    result = result.filter((p) => p.price <= currentMaxPrice);
  }

  result = [...result];

  if (currentSort === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (currentSort === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (currentSort === "rating-desc") {
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return result;
}

function refreshView() {
  const filtered = getVisibleProducts();
  renderProducts(productsGrid, filtered.slice(0, visibleCount));
  loadMoreBtn.hidden = visibleCount >= filtered.length;
}

// بترجع لحجم الصفحة الأول وتحدّث الرابط — تستعمل كي يتبدل فلتر
function resetAndRefresh() {
  visibleCount = PAGE_SIZE;
  refreshView();
  updateURLParams();
}

loadMoreBtn.addEventListener("click", () => {
  visibleCount += PAGE_SIZE;
  refreshView();
});

// =========================================================
// 4) عرض المنتجات (مشتركة بين الكتالوج والأكثر مبيعًا)
// =========================================================
function renderProducts(container, products) {
  container.replaceChildren();

  if (products.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "no-results";
    emptyMsg.textContent = "لا توجد منتجات مطابقة لبحثك.";
    container.appendChild(emptyMsg);
    return;
  }

  products.forEach((product) => {
    const clone = productCardTemplate.content.cloneNode(true);

    const productOpen = clone.querySelector(".product-open");
    const image = clone.querySelector("img");
    const discountBadge = clone.querySelector(".discount-badge");
    const categoryLabel = clone.querySelector(".product-category");
    const title = clone.querySelector(".product-title");
    const ratingValue = clone.querySelector(".rating-value");
    const originalPrice = clone.querySelector(".original-price");
    const price = clone.querySelector(".product-price");
    const addButton = clone.querySelector(".add-to-cart-btn");
    const wishlistBtn = clone.querySelector(".wishlist-btn");
    const compareCheckbox = clone.querySelector(".compare-checkbox");

    image.src = product.thumbnail;
    image.alt = product.title;

    categoryLabel.textContent =
      categoryLabels[product.category] || product.category;
    title.textContent = product.title;
    ratingValue.textContent = product.rating ? product.rating.toFixed(1) : "—";
    price.textContent = `$${product.price.toFixed(2)}`;

    if (product.discountPercentage && product.discountPercentage > 0) {
      discountBadge.hidden = false;
      discountBadge.textContent = `-${Math.round(product.discountPercentage)}%`;

      const original = product.price / (1 - product.discountPercentage / 100);
      originalPrice.hidden = false;
      originalPrice.textContent = `$${original.toFixed(2)}`;
    }

    // فتح صفحة تفاصيل المنتج
    productOpen.addEventListener("click", () => {
      openProductModal(product);
    });

    // المفضلة
    wishlistBtn.textContent = isInWishlist(product.id) ? "❤️" : "🤍";
    wishlistBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWishlistItem(product);
    });

    // المقارنة
    compareCheckbox.checked = compareList.includes(product.id);
    compareCheckbox.addEventListener("click", (e) => e.stopPropagation());
    compareCheckbox.addEventListener("change", () => {
      const ok = toggleCompare(product, compareCheckbox.checked);
      if (!ok) compareCheckbox.checked = false;
    });

    // أضف للسلة + الأنيميشن
    addButton.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(product);
      flyToCart(image);
      pulseCartIcon();
      showToast("تمت الإضافة إلى السلة ✓");
    });

    container.appendChild(clone);
  });
}

function renderBestSellers() {
  const sorted = [...allProducts].sort(
    (a, b) => (b.rating || 0) - (a.rating || 0),
  );
  renderProducts(bestSellersGrid, sorted.slice(0, 6));
}

// =========================================================
// 5) البحث / الترتيب / فلتر السعر
// =========================================================
searchInput.addEventListener("input", () => {
  currentSearchTerm = searchInput.value.toLowerCase().trim();
  resetAndRefresh();
});

sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value;
  resetAndRefresh();
});

minPriceInput.addEventListener("change", () => {
  currentMinPrice = minPriceInput.value
    ? parseFloat(minPriceInput.value)
    : null;
  resetAndRefresh();
});

maxPriceInput.addEventListener("change", () => {
  currentMaxPrice = maxPriceInput.value
    ? parseFloat(maxPriceInput.value)
    : null;
  resetAndRefresh();
});

// =========================================================
// 6) حفظ الفلاتر فـ رابط الصفحة (URL params)
// =========================================================
function updateURLParams() {
  const params = new URLSearchParams();

  if (currentSearchTerm) params.set("q", currentSearchTerm);
  if (currentCategory !== "all") params.set("cat", currentCategory);
  if (currentSort !== "default") params.set("sort", currentSort);
  if (currentMinPrice !== null) params.set("min", currentMinPrice);
  if (currentMaxPrice !== null) params.set("max", currentMaxPrice);

  const query = params.toString();
  const newUrl = query ? `${location.pathname}?${query}` : location.pathname;
  history.replaceState(null, "", newUrl);
}

function readURLParams() {
  const params = new URLSearchParams(window.location.search);

  currentSearchTerm = (params.get("q") || "").toLowerCase();
  currentCategory = params.get("cat") || "all";
  currentSort = params.get("sort") || "default";
  currentMinPrice = params.has("min") ? parseFloat(params.get("min")) : null;
  currentMaxPrice = params.has("max") ? parseFloat(params.get("max")) : null;

  searchInput.value = currentSearchTerm;
  sortSelect.value = currentSort;
  if (currentMinPrice !== null) minPriceInput.value = currentMinPrice;
  if (currentMaxPrice !== null) maxPriceInput.value = currentMaxPrice;
}

// =========================================================
// 7) الوضع الليلي / النهاري
// =========================================================
function applyTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  themeToggleBtn.textContent = theme === "light" ? "🌙" : "☀️";
  localStorage.setItem("theme", theme);
}

themeToggleBtn.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("light-theme")
    ? "dark"
    : "light";
  applyTheme(newTheme);
});

// =========================================================
// 8) صفحة تفاصيل المنتج (Modal)
// =========================================================
function openProductModal(product) {
  modalCategory.textContent =
    categoryLabels[product.category] || product.category;
  modalTitle.textContent = product.title;
  modalRating.textContent = product.rating
    ? `⭐ ${product.rating.toFixed(1)}`
    : "—";
  modalDescription.textContent = product.description || "";
  modalPrice.textContent = `$${product.price.toFixed(2)}`;

  if (product.discountPercentage && product.discountPercentage > 0) {
    const original = product.price / (1 - product.discountPercentage / 100);
    modalOriginalPrice.hidden = false;
    modalOriginalPrice.textContent = `$${original.toFixed(2)}`;
  } else {
    modalOriginalPrice.hidden = true;
  }

  const images =
    product.images && product.images.length
      ? product.images
      : [product.thumbnail];
  modalMainImage.src = images[0];
  modalMainImage.alt = product.title;

  modalThumbnails.replaceChildren();
  images.forEach((imgUrl) => {
    const thumb = document.createElement("img");
    thumb.src = imgUrl;
    thumb.alt = product.title;
    thumb.className = "modal-thumb";
    thumb.addEventListener("click", () => {
      modalMainImage.src = imgUrl;
    });
    modalThumbnails.appendChild(thumb);
  });

  modalAddToCart.onclick = () => {
    addToCart(product);
    flyToCart(modalMainImage);
    pulseCartIcon();
    showToast("تمت الإضافة إلى السلة ✓");
  };

  productModalOverlay.hidden = false;
  productModal.hidden = false;
}

function closeProductModal() {
  productModalOverlay.hidden = true;
  productModal.hidden = true;
}

productModalClose.addEventListener("click", closeProductModal);
productModalOverlay.addEventListener("click", closeProductModal);

// =========================================================
// 9) إدارة السلة
// =========================================================
function addToCart(product) {
  let existingProduct = cart.find((item) => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.thumbnail,
      quantity: 1,
    });
  }
  saveCartToStorage();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCartToStorage();
  renderCart();
}

function updateQuantity(productId, newQty) {
  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  const product = cart.find((item) => item.id === productId);
  if (!product) return;

  product.quantity = newQty;
  saveCartToStorage();
  renderCart();
}

function renderCart() {
  cartItemsList.replaceChildren();

  cart.forEach((product) => {
    const clone = cartItemTemplate.content.cloneNode(true);

    const image = clone.querySelector("img");
    const title = clone.querySelector(".cart-item-title");
    const price = clone.querySelector(".cart-item-price");
    const quantity = clone.querySelector(".qty-value");

    const increaseBtn = clone.querySelector(".qty-increase");
    const decreaseBtn = clone.querySelector(".qty-decrease");
    const removeBtn = clone.querySelector(".cart-item-remove");

    image.src = product.image;
    image.alt = product.title;

    title.textContent = product.title;
    price.textContent = `$${product.price.toFixed(2)}`;
    quantity.textContent = product.quantity;

    increaseBtn.addEventListener("click", () => {
      updateQuantity(product.id, product.quantity + 1);
    });

    decreaseBtn.addEventListener("click", () => {
      updateQuantity(product.id, product.quantity - 1);
    });

    removeBtn.addEventListener("click", () => {
      removeFromCart(product.id);
    });

    cartItemsList.appendChild(clone);
  });

  const totalQuantity = cart.reduce(
    (total, product) => total + product.quantity,
    0,
  );
  const totalPrice = cart.reduce(
    (total, product) => total + product.price * product.quantity,
    0,
  );

  cartCountBadge.textContent = totalQuantity;
  cartTotalEl.textContent = `$${totalPrice.toFixed(2)}`;

  cartEmptyMessage.hidden = cart.length !== 0;
  checkoutBtn.disabled = cart.length === 0;
}

function saveCartToStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCartFromStorage() {
  try {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (Array.isArray(parsedCart)) {
        cart = parsedCart;
      }
    }
  } catch (error) {
    console.error("Error loading cart:", error);
    cart = [];
  }
  renderCart();
}

function openCart() {
  cartDrawer.classList.add("is-open");
  cartOverlay.classList.add("is-open");
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartOverlay.classList.remove("is-open");
}

cartToggleBtn.addEventListener("click", openCart);
cartCloseBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// =========================================================
// 10) المفضلة (Wishlist)
// =========================================================
function isInWishlist(productId) {
  return wishlist.some((item) => item.id === productId);
}

function toggleWishlistItem(product) {
  if (isInWishlist(product.id)) {
    wishlist = wishlist.filter((item) => item.id !== product.id);
  } else {
    wishlist.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.thumbnail,
    });
  }
  saveWishlistToStorage();
  renderWishlistDrawer();
  refreshView();
  renderBestSellers();
}

function renderWishlistDrawer() {
  wishlistItemsList.replaceChildren();

  wishlist.forEach((product) => {
    const clone = wishlistItemTemplate.content.cloneNode(true);

    const image = clone.querySelector("img");
    const title = clone.querySelector(".cart-item-title");
    const price = clone.querySelector(".cart-item-price");
    const removeBtn = clone.querySelector(".wishlist-item-remove");
    const addCartBtn = clone.querySelector(".wishlist-item-add-cart");

    image.src = product.image;
    image.alt = product.title;
    title.textContent = product.title;
    price.textContent = `$${product.price.toFixed(2)}`;

    removeBtn.addEventListener("click", () => toggleWishlistItem(product));
    addCartBtn.addEventListener("click", () => {
      addToCart(product);
      showToast("تمت الإضافة إلى السلة ✓");
    });

    wishlistItemsList.appendChild(clone);
  });

  wishlistCountBadge.textContent = wishlist.length;
  wishlistEmptyMessage.hidden = wishlist.length !== 0;
}

function saveWishlistToStorage() {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function loadWishlistFromStorage() {
  try {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        wishlist = parsed;
      }
    }
  } catch (error) {
    console.error("Error loading wishlist:", error);
    wishlist = [];
  }
  renderWishlistDrawer();
}

function openWishlist() {
  wishlistDrawer.classList.add("is-open");
  wishlistOverlay.classList.add("is-open");
}

function closeWishlist() {
  wishlistDrawer.classList.remove("is-open");
  wishlistOverlay.classList.remove("is-open");
}

wishlistToggleBtn.addEventListener("click", openWishlist);
wishlistCloseBtn.addEventListener("click", closeWishlist);
wishlistOverlay.addEventListener("click", closeWishlist);

// =========================================================
// 11) مقارنة المنتجات
// =========================================================
function toggleCompare(product, checked) {
  if (checked) {
    if (compareList.length >= 2) {
      showToast("يمكنك مقارنة منتجين فقط فـ نفس الوقت");
      return false;
    }
    compareList.push(product.id);
  } else {
    compareList = compareList.filter((id) => id !== product.id);
  }
  updateCompareBar();
  return true;
}

function updateCompareBar() {
  if (compareList.length === 0) {
    compareBar.hidden = true;
    return;
  }
  compareBar.hidden = false;
  compareCountText.textContent = `تم اختيار ${compareList.length} من 2 للمقارنة`;
  compareNowBtn.disabled = compareList.length < 2;
}

compareClearBtn.addEventListener("click", () => {
  compareList = [];
  updateCompareBar();
  refreshView();
  renderBestSellers();
});

compareNowBtn.addEventListener("click", () => {
  const products = compareList
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean);
  renderCompareTable(products);
  compareModalOverlay.hidden = false;
  compareModal.hidden = false;
});

function renderCompareTable(products) {
  const rows = [
    {
      label: "الصورة",
      render: (p) => `<img src="${p.thumbnail}" alt="${p.title}">`,
    },
    { label: "الاسم", render: (p) => p.title },
    { label: "الفئة", render: (p) => categoryLabels[p.category] || p.category },
    { label: "السعر", render: (p) => `$${p.price.toFixed(2)}` },
    {
      label: "التقييم",
      render: (p) => (p.rating ? `⭐ ${p.rating.toFixed(1)}` : "—"),
    },
    { label: "المخزون", render: (p) => p.stock ?? "—" },
    { label: "العلامة التجارية", render: (p) => p.brand ?? "—" },
  ];

  let html = '<table class="compare-table-inner"><tbody>';
  rows.forEach((row) => {
    html += `<tr><th>${row.label}</th>`;
    products.forEach((p) => {
      html += `<td>${row.render(p)}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";

  compareTable.innerHTML = html;
}

function closeCompareModal() {
  compareModalOverlay.hidden = true;
  compareModal.hidden = true;
}

compareModalClose.addEventListener("click", closeCompareModal);
compareModalOverlay.addEventListener("click", closeCompareModal);

// =========================================================
// 12) إتمام الشراء (Checkout)
// =========================================================
checkoutBtn.addEventListener("click", () => {
  checkoutForm.hidden = false;
  checkoutSuccess.hidden = true;
  checkoutModalOverlay.hidden = false;
  checkoutModal.hidden = false;
});

function closeCheckoutModal() {
  checkoutModalOverlay.hidden = true;
  checkoutModal.hidden = true;
}

checkoutModalClose.addEventListener("click", closeCheckoutModal);
checkoutModalOverlay.addEventListener("click", closeCheckoutModal);

checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();

  checkoutForm.hidden = true;
  checkoutSuccess.hidden = false;

  cart = [];
  saveCartToStorage();
  renderCart();
  closeCart();

  checkoutForm.reset();

  setTimeout(() => {
    closeCheckoutModal();
  }, 2500);
});

// =========================================================
// 13) أنيميشن الإضافة للسلة + Toast
// =========================================================
function flyToCart(imgEl) {
  const imgRect = imgEl.getBoundingClientRect();
  const cartRect = cartToggleBtn.getBoundingClientRect();

  const flyer = imgEl.cloneNode(true);
  flyer.className = "fly-to-cart";
  flyer.style.left = `${imgRect.left}px`;
  flyer.style.top = `${imgRect.top}px`;
  flyer.style.width = `${imgRect.width}px`;
  flyer.style.height = `${imgRect.height}px`;
  flyer.style.opacity = "1";
  document.body.appendChild(flyer);

  requestAnimationFrame(() => {
    flyer.style.left = `${cartRect.left + cartRect.width / 2 - 10}px`;
    flyer.style.top = `${cartRect.top + cartRect.height / 2 - 10}px`;
    flyer.style.width = "20px";
    flyer.style.height = "20px";
    flyer.style.opacity = "0.2";
  });

  flyer.addEventListener(
    "transitionend",
    () => {
      flyer.remove();
    },
    { once: true },
  );
}

function pulseCartIcon() {
  cartToggleBtn.classList.add("cart-bounce");
  setTimeout(() => cartToggleBtn.classList.remove("cart-bounce"), 400);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// =========================================================
// نقطة الانطلاق (Initialization)
// =========================================================
readURLParams();
applyTheme(localStorage.getItem("theme") || "dark");
loadCartFromStorage();
loadWishlistFromStorage();
fetchProducts();
