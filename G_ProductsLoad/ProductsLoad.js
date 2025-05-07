document.addEventListener("DOMContentLoaded", function () {
  const itemsPerPage = 8;
  let productsArray = [];
  let filteredArray = [];
  let currentPage = 1;

  const container = document.getElementById("Products");
  const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");
  const pageNumbersContainer = document.getElementById("pageNumbers");

  // --- Add to Cart Setup ---
  function setupAddToCartButtons() {
    const buttons = document.querySelectorAll(".add-to-cart-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", async function () {
        const productCard = this.closest(".product-card");
        if (!productCard) return console.error("No product card found.");

        const productId = productCard.dataset.productId;
        if (!productId) return console.error("Missing productId on product card");

        const userStr = localStorage.getItem("loggedInUser");
        if (!userStr) return swal("Please log in first!", "", "warning");

        const user = JSON.parse(userStr);
        const customerId = user.id;

        try {
          const res = await fetch(`http://localhost:5000/Cart?customerId=${customerId}`);
          const existingCarts = await res.json();

          let customerCart = existingCarts.find(cart => cart.customerId === customerId);

          if (!customerCart) {
            const newCart = {
              id: crypto.randomUUID(),
              customerId,
              orders: [{
                id: crypto.randomUUID(),
                productId,
                quantity: 1,
                status: "in cart"
              }]
            };

            await fetch("http://localhost:5000/Cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newCart)
            });

            console.log("New cart created.");
          } else {
            const existingOrder = customerCart.orders.find(o => o.productId === productId);
            if (existingOrder) {
              existingOrder.quantity += 1;
            } else {
              customerCart.orders.push({
                id: crypto.randomUUID(),
                productId,
                quantity: 1,
                status: "in cart"
              });
            }

            await fetch(`http://localhost:5000/Cart/${customerCart.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(customerCart)
            });

            console.log("Cart updated.");
          }

          animateSuccess(this);
        } catch (err) {
          console.error("Error handling cart:", err);
        }
      });
    });
  }

  function animateSuccess(button) {
    const originalText = button.textContent;
    button.textContent = "✓ Added";
    button.style.backgroundColor = "#28a745";
    button.style.color = "#fff";
    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = "";
      button.style.color = "";
    }, 1200);
  }

  // --- Fetch Products ---
  function fetchProducts() {
    fetch("http://localhost:5000/Products?isPending=false")
      .then(res => res.json())
      .then(data => {
        productsArray = data || [];
        filteredArray = productsArray;
        currentPage = 1;
        renderProducts(filteredArray);
        setupPagination(filteredArray);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
      });
  }

  // --- Render Products with Pagination ---
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

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = products.slice(startIndex, endIndex);

    paginatedItems.forEach((item) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.dataset.productId = item.id;

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

    setupAddToCartButtons(); // Reattach listeners
  }

  // --- Setup Pagination ---
  function setupPagination(products) {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    pageNumbersContainer.innerHTML = "";

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;

    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.textContent = i;
      pageBtn.classList.add("pagination-button");
      if (i === currentPage) pageBtn.classList.add("active");

      pageBtn.addEventListener("click", () => {
        currentPage = i;
        renderProducts(products);
        setupPagination(products);
      });

      pageNumbersContainer.appendChild(pageBtn);
    }

    prevButton.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderProducts(products);
        setupPagination(products);
      }
    };

    nextButton.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderProducts(products);
        setupPagination(products);
      }
    };
  }

  // --- Category Filtering ---
  function setupEventListeners() {
    categoryCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        categoryCheckboxes.forEach((cb) => {
          if (cb !== this) cb.checked = false;
        });

        const selected = Array.from(categoryCheckboxes).find(cb => cb.checked);
        if (!selected || selected.value === "all") {
          filteredArray = productsArray;
        } else {
          filteredArray = productsArray.filter(
            (product) => product.Category.toLowerCase() === selected.value.toLowerCase()
          );
        }

        currentPage = 1;
        renderProducts(filteredArray);
        setupPagination(filteredArray);
      });
    });
  }

  // --- Observe Product Container for Dynamically Loaded Elements ---
  if (container) {
    const observer = new MutationObserver(setupAddToCartButtons);
    observer.observe(container, { childList: true, subtree: true });
  }

  // --- Init ---
  function init() {
    fetchProducts();
    setupEventListeners();
  }

  window.addEventListener("load", init);
});
