onst $ = id => document.getElementById(id);

const STORAGE_KEY = "store_locator_products_v1";

const initialProducts = [
  {
    id: "P101",
    name: "Rice Bag 5kg",
    category: "Grocery",
    price: 320,
    quantity: 25,
    aisle: "A1",
    shelf: "S1"
  },
  {
    id: "P102",
    name: "Cooking Oil 1L",
    category: "Grocery",
    price: 145,
    quantity: 12,
    aisle: "A1",
    shelf: "S2"
  },
  {
    id: "P103",
    name: "Wireless Mouse",
    category: "Electronics",
    price: 599,
    quantity: 8,
    aisle: "A2",
    shelf: "S1"
  },
  {
    id: "P104",
    name: "LED Bulb",
    category: "Electronics",
    price: 120,
    quantity: 0,
    aisle: "A2",
    shelf: "S3"
  },
  {
    id: "P105",
    name: "Floor Cleaner",
    category: "Household",
    price: 180,
    quantity: 14,
    aisle: "A3",
    shelf: "S2"
  },
  {
    id: "P106",
    name: "Shampoo",
    category: "Personal Care",
    price: 210,
    quantity: 20,
    aisle: "A4",
    shelf: "S1"
  }
];

let products = [];
let selectedId = null;

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  products = saved === null
    ? initialProducts.map(p => ({ ...p }))
    : JSON.parse(saved);

  if (!Array.isArray(products)) products = [];
} catch {
  products = initialProducts.map(p => ({ ...p }));
}

function saveProducts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch {
    alert("Unable to save products in browser storage.");
    return false;
  }
}

function money(value) {
  return Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  });
}

function renderStats() {
  $("totalProducts").textContent = products.length;
  $("inStock").textContent =
    products.filter(p => p.quantity > 0).length;
  $("outStock").textContent =
    products.filter(p => p.quantity === 0).length;
}

function renderProducts() {
  const query = $("searchInput").value.trim().toLowerCase();
  const category = $("categoryFilter").value;

  const filtered = products.filter(p => {
    const matchesQuery =
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      p.aisle.toLowerCase().includes(query) ||
      p.shelf.toLowerCase().includes(query);

    return matchesQuery &&
      (category === "All" || p.category === category);
  });

  const list = $("productList");
  list.innerHTML = "";

  filtered.forEach(product => {
    const item = document.createElement("article");
    item.className = "product-item" +
      (selectedId === product.id ? " active" : "");

    const info = document.createElement("div");
    info.className = "product-info";

    const name = document.createElement("h3");
    name.textContent = product.name;

    const detail = document.createElement("p");
    detail.textContent =
      `${product.id} · ${product.category} · ${money(product.price)}`;

    const location = document.createElement("p");
    location.textContent =
      `Aisle ${product.aisle} · Shelf ${product.shelf}`;

    const stock = document.createElement("p");
    stock.className = "stock " +
      (product.quantity > 0 ? "in-stock" : "out-stock");
    stock.textContent = product.quantity > 0
      ? `${product.quantity} units available`
      : "Out of stock";

    info.append(name, detail, location, stock);

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const locate = document.createElement("button");
    locate.className = "locate-btn";
    locate.textContent = "Locate";
    locate.addEventListener("click", () => selectProduct(product.id));

    const edit = document.createElement("button");
    edit.className = "edit-btn";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => editProduct(product.id));

    actions.append(locate, edit);
    item.append(info, actions);
    list.appendChild(item);
  });

  $("resultCount").textContent = `${filtered.length} products`;
  $("emptyMessage").hidden = filtered.length > 0;

  renderStats();
}

function selectProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  selectedId = id;

  const details = $("locationDetails");
  details.replaceChildren();

  const icon = document.createElement("div");
  icon.className = "location-icon";
  icon.textContent = "📍";

  const heading = document.createElement("h3");
  heading.textContent = product.name;

  const lines = [
    `Product ID: ${product.id}`,
    `Category: ${product.category}`,
    `Aisle: ${product.aisle}`,
    `Shelf: ${product.shelf}`,
    `Price: ${money(product.price)}`,
    `Stock: ${product.quantity > 0
      ? product.quantity + " units available"
      : "Out of stock"}`
  ];

  details.append(icon, heading);

  lines.forEach(text => {
    const p = document.createElement("p");
    p.textContent = text;
    details.appendChild(p);
  });

  document.querySelectorAll(".aisle").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.aisle === product.aisle
    );
  });

  $("mapMessage").textContent =
    `${product.name} is in aisle ${product.aisle}, shelf ${product.shelf}.`;

  renderProducts();
}

function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  $("productId").value = product.id;
  $("productName").value = product.name;
  $("productCategory").value = product.category;
  $("productPrice").value = product.price;
  $("productQuantity").value = product.quantity;
  $("productAisle").value = product.aisle;
  $("productShelf").value = product.shelf;

  $("formMessage").textContent =
    "Editing product. Save to update its details.";

  $("productId").readOnly = true;
  $("productForm").scrollIntoView({ behavior: "smooth" });
}

$("productForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = $("productId").value.trim();
  const name = $("productName").value.trim();
  const category = $("productCategory").value;
  const price = Number($("productPrice").value);
  const quantity = Number($("productQuantity").value);
  const aisle = $("productAisle").value;
  const shelf = $("productShelf").value;

  if (
    !id || !name ||
    !["Grocery", "Electronics", "Household",
      "Personal Care"].includes(category) ||
    !Number.isFinite(price) || price < 0 ||
    !Number.isSafeInteger(quantity) || quantity < 0 ||
    !/^A[1-4]$/.test(aisle) ||
    !/^S[1-4]$/.test(shelf)
  ) {
    $("formMessage").textContent =
      "Please enter valid product details.";
    return;
  }

  const existing = products.find(p => p.id === id);

  const product = {
    id, name, category, price, quantity, aisle, shelf
  };

  if (existing) {
    const index = products.findIndex(p => p.id === id);
    products[index] = product;
  } else {
    products.push(product);
  }

  if (!saveProducts()) {
    if (existing) {
      products[products.findIndex(p => p.id === id)] = existing;
    } else {
      products = products.filter(p => p.id !== id);
    }
    return;
  }

  $("formMessage").textContent = existing
    ? "Product updated successfully."
    : "Product added successfully.";

  $("productForm").reset();
  $("productId").readOnly = false;

  if (selectedId === id) {
    selectedId = null;
    $("locationDetails").textContent =
      "Select a product to see its location.";
    $("mapMessage").textContent =
      "Select a product to highlight its aisle.";
    document.querySelectorAll(".aisle").forEach(el =>
      el.classList.remove("active")
    );
  }

  renderProducts();
});

$("productForm").addEventListener("reset", () => {
  $("productId").readOnly = false;
});

$("searchInput").addEventListener("input", renderProducts);
$("categoryFilter").addEventListener("change", renderProducts);

document.querySelectorAll(".aisle").forEach(button => {
  button.addEventListener("click", () => {
    const aisle = button.dataset.aisle;
    $("categoryFilter").value = "All";
    $("searchInput").value = "";
    renderProducts();

    const first = products.find(p => p.aisle === aisle);
    if (first) {
      selectProduct(first.id);
      $("mapMessage").textContent =
        `Showing aisle ${aisle}. Select any product in this aisle to locate its shelf.`;
    } else {
      selectedId = null;
      $("locationDetails").textContent =
        `No products are registered in aisle ${aisle}.`;
      document.querySelectorAll(".aisle").forEach(el =>
        el.classList.toggle("active", el === button)
      );
      $("mapMessage").textContent = `Aisle ${aisle} has no products.`;
      renderProducts();
    }
  });
});

renderProducts();