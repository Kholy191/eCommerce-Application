// Global variables
let productsArray = [];

// DOM elements
const container = document.getElementById("Products");
const categoryCheckboxes = document.querySelectorAll('input[name="category"]');

// Initialize the page
function init() {
  fetchProducts();
  setupEventListeners();
}

// Fetch products from server
function fetchProducts() {
  fetch("http://localhost:5000/Products?isPending=false")
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        console.error("Products not found in response data");
        return;
      }
      
      productsArray = data;
      renderProducts(productsArray);
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
    });
}

// Set up event listeners
function setupEventListeners() {
  // Category checkboxes
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", function() {
      if (this.value === "all" && this.checked) {
        // Uncheck other category checkboxes when "All" is selected
        categoryCheckboxes.forEach(cb => {
          if (cb.value !== "all") cb.checked = false;
        });
        renderProducts(productsArray);
      } else if (this.value !== "all" && this.checked) {
        // Uncheck "All" when a specific category is selected
        document.querySelector('input[name="category"][value="all"]').checked = false;
        filterByCategory(this.value);
      }
    });
  });
}

// Filter products by category
function filterByCategory(category) {
  const filteredProducts = productsArray.filter(product => 
    product.Category.toLowerCase() === category.toLowerCase()
  );
  renderProducts(filteredProducts);
}

// Render products to the DOM
function renderProducts(products) {
  if (!container) {
    console.error("Container not found!");
    return;
  }
  
  container.innerHTML = "";
  
  if (products.length === 0) {
    container.innerHTML = "<p class='no-products'>No products found in this category.</p>";
    return;
  }
  
  products.forEach((item) => {
    const card = document.createElement("div");
    card.className = "product-card";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;

    const title = document.createElement("h3");
    title.textContent = item.name;

    const price = document.createElement("p");
    price.textContent = `$${parseFloat(item.price).toFixed(2)}`;

    const button = document.createElement("button");
    button.className = "add-to-cart-btn";
    button.textContent = "Add to Cart";

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(button);

    container.appendChild(card);
  });
}

// Initialize the page when loaded
window.addEventListener("load", init);