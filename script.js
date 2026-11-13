// =========================================================
// مراجع العناصر (DOM references)
// =========================================================
const productsGrid = document.getElementById("products-grid");
const loadingIndicator = document.getElementById("loading-indicator");
const errorMessage = document.getElementById("error-message");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const categoryFiltersEl = document.getElementById("category-filters");
const productCardTemplate = document.getElementById("product-card-template");
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

// =========================================================
// الحالة (State)
// =========================================================
// API جديد فيه قريب 200 منتج موزعين على بزاف ديال الفئات (ماشي غير إلكترونيات)
const API_URL = "https://dummyjson.com/products?limit=100";

let allProducts = []; // كل المنتجات بعد جلبها من الـ API
let cart = []; // كل عنصر: { id, title, price, image, quantity }

// حالة الفلترة/الترتيب الحالية — مخزّنة باش البحث والفئة والترتيب يخدمو مع بعض
let currentSearchTerm = "";
let currentCategory = "all";
let currentSort = "default";

// ترجمة أسماء الفئات (dummyjson كيرجعها بالإنجليزية)
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
    loadingIndicator.hidden = false;
    errorMessage.hidden = true;

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    allProducts = data.products;

    renderCategoryFilters();
    refreshView();
  } catch (error) {
    console.error("Fetch error:", error);
    errorMessage.hidden = false;
  } finally {
    loadingIndicator.hidden = true;
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

      refreshView();
    });

    categoryFiltersEl.appendChild(btn);
  });
}

// =========================================================
// 3) المنطق المشترك: بحث + فئة + ترتيب
// =========================================================
// دالة واحدة مركزية كتجمع البحث والفئة والترتيب مع بعض،
// باش بدّل الفئة ولا الترتيب ما يمحيش نتيجة البحث (والعكس صحيح)
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
  renderProducts(getVisibleProducts());
}

// =========================================================
// 4) عرض المنتجات فالصفحة
// =========================================================
function renderProducts(products) {
  productsGrid.replaceChildren();

  if (products.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "no-results";
    emptyMsg.textContent = "لا توجد منتجات مطابقة لبحثك.";
    productsGrid.appendChild(emptyMsg);
    return;
  }

  products.forEach((product) => {
    const clone = productCardTemplate.content.cloneNode(true);

    const image = clone.querySelector("img");
    const discountBadge = clone.querySelector(".discount-badge");
    const categoryLabel = clone.querySelector(".product-category");
    const title = clone.querySelector(".product-title");
    const ratingValue = clone.querySelector(".rating-value");
    const originalPrice = clone.querySelector(".original-price");
    const price = clone.querySelector(".product-price");
    const addButton = clone.querySelector(".add-to-cart-btn");

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

    addButton.addEventListener("click", () => {
      addToCart(product);
    });

    productsGrid.appendChild(clone);
  });
}

// =========================================================
// 5) البحث
// =========================================================
searchInput.addEventListener("input", () => {
  currentSearchTerm = searchInput.value.toLowerCase().trim();
  refreshView();
});

// =========================================================
// 6) الترتيب (Sorting)
// =========================================================
sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value;
  refreshView();
});

// =========================================================
// 7) إدارة السلة
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

// =========================================================
// 8) حفظ واسترجاع السلة (localStorage)
// =========================================================
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

// =========================================================
// 9) فتح وإغلاق سلة التسوق (Drawer)
// =========================================================
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
// نقطة الانطلاق (Initialization)
// =========================================================
loadCartFromStorage();
fetchProducts();
