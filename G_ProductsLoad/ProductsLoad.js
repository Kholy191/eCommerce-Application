document.addEventListener("DOMContentLoaded", function () {
  // Function to set up the "Add to Cart" buttons
  function setupAddToCartButtons() {
    const buttons = document.querySelectorAll(".add-to-cart-btn");

    buttons.forEach((button) => {
      button.addEventListener("click", async function () {
        // Access the product card
        const productCard = this.closest(".product-card");
        if (!productCard) {
          console.error("No product card found.");
          return;
        }

        // Retrieve the productId from the data attribute
        const productId = productCard.dataset.productId;

        // Debugging: Log the product card and the productId
        console.log("Product Card:", productCard);
        console.log("Product ID:", productId);  // Should show the correct ID or 'undefined' if not set properly

        if (!productId) {
          console.error("Missing productId on product card");
          return;
        }

        const userStr = localStorage.getItem("loggedInUser");
        if (!userStr) {
          swal("Please log in first!", "", "warning");
          return;
        }

        const user = JSON.parse(userStr);
        const customerId = user.id;

        try {
          // Fetch existing cart(s) for the customer
          const res = await fetch(`http://localhost:5000/Cart?customerId=${customerId}`);
          const existingCarts = await res.json();

          let customerCart = existingCarts.find(cart => cart.customerId === customerId);

          if (!customerCart) {
            // Create a new cart if no cart exists
            const newCart = {
              id: crypto.randomUUID(),
              customerId,
              orders: [
                {
                  id: crypto.randomUUID(),
                  productId: productId,
                  quantity: 1,
                  status: "in cart"
                }
              ]
            };

            // Send the new cart to the server
            await fetch("http://localhost:5000/Cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newCart)
            });

            console.log("New cart created.");
          } else {
            // Update the existing cart
            const existingOrder = customerCart.orders.find(o => o.productId === productId);

            if (existingOrder) {
              existingOrder.quantity += 1;
            } else {
              customerCart.orders.push({
                id: crypto.randomUUID(),
                productId: productId,
                quantity: 1,
                status: "in cart"
              });
            }

            // Update the cart on the server
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

  // Function to animate the success message after adding to cart
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

  // Watch for dynamically loaded products
  const container = document.getElementById("Products");
  if (container) {
    const observer = new MutationObserver(setupAddToCartButtons);
    observer.observe(container, { childList: true, subtree: true });
  }

  setupAddToCartButtons();

  // Render products to the DOM
  function renderProducts(products) {
    if (!container) {
      console.error("Container not found!");
      return;
    }

    container.innerHTML = "";

    if (products.length === 0) {
      container.innerHTML =
        "<p class='no-products'>No products found in this category.</p>";
      return;
    }

    products.forEach((item) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.dataset.productId = item.id;  // Set the product ID here

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

  // Pagination for products
  let productsArray = [];
  let filteredArray = [];
  let currentPage = 1;
  const itemsPerPage = 8;

  const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");
  const pageNumbersContainer = document.getElementById("pageNumbers");

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
        filteredArray = productsArray;
        currentPage = 1;
        renderProducts(filteredArray);
        setupPagination(filteredArray);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }

  // Set up event listeners
  function setupEventListeners() {
    categoryCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        // Uncheck all checkboxes except the clicked one
        categoryCheckboxes.forEach((cb) => {
          if (cb !== this) cb.checked = false;
        });

        // If nothing is checked, reset to all
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

  // Setup pagination
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

  // Initialize the page when loaded
  window.addEventListener("load", init);
});
