document.addEventListener("DOMContentLoaded", function () {
  const itemsPerPage = 8;
  let productsArray = [];
  let filteredArray = [];
  let currentPage = 1;

  const container = document.getElementById("Products");
  const categoryCheckboxes = document.querySelectorAll(
    'input[name="category"]'
  );
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");
  const pageNumbersContainer = document.getElementById("pageNumbers");

  function setupAddToCartButtons() {
    const buttons = document.querySelectorAll(".add-to-cart-btn");
    buttons.forEach((button) => {
      if (button.dataset.listenerAttached === "true") return;
      button.dataset.listenerAttached = "true";

      button.addEventListener("click", async function () {
        if (button.dataset.isProcessing === "true") return;
        button.dataset.isProcessing = "true";

        const productCard = this.closest(".product-card");
        if (!productCard) {
          console.error("No product card found.");
          button.dataset.isProcessing = "false";
          return;
        }

        const productId = productCard.dataset.productId;
        if (!productId) {
          console.error("Missing productId on product card");
          button.dataset.isProcessing = "false";
          return;
        }

        const userStr = localStorage.getItem("loggedInUser");
        if (!userStr) {
          swal("Please log in first!", "", "warning");
          button.dataset.isProcessing = "false";
          return;
        }

        const user = JSON.parse(userStr);
        const customerId = user.id;

        try {
          const res = await fetch(
            `http://localhost:5000/Cart?customerId=${customerId}`
          );
          const existingCarts = await res.json();

          let customerCart = existingCarts.find(
            (cart) => cart.customerId === customerId
          );

          if (!customerCart) {
            // Create new cart if doesn't exist
            const newCart = {
              id: crypto.randomUUID(),
              customerId,
              orders: [
                {
                  id: crypto.randomUUID(),
                  productId,
                  quantity: 1,
                  status: "in cart",
                },
              ],
            };

            await fetch("http://localhost:5000/Cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newCart),
            });

            console.log("New cart created.");
          } else {
            // Check if product exists in cart with status "drafted"
            const draftedOrder = customerCart.orders.find(
              (o) => o.productId === productId && o.status === "drafted"
            );

            // Check if product exists in cart with status "in cart"
            const inCartOrder = customerCart.orders.find(
              (o) => o.productId === productId && o.status === "in cart"
            );

            if (draftedOrder && !inCartOrder) {
              // If product exists with status "drafted" but no "in cart" item exists
              customerCart.orders.push({
                id: crypto.randomUUID(),
                productId,
                quantity: 1,
                status: "in cart",
              });
            } else if (inCartOrder) {
              // If product exists with status "in cart", increase quantity
              inCartOrder.quantity += 1;
            } else {
              // Product doesn't exist in cart at all, add new item
              customerCart.orders.push({
                id: crypto.randomUUID(),
                productId,
                quantity: 1,
                status: "in cart",
              });
            }

            // Update the cart on server
            await fetch(`http://localhost:5000/Cart/${customerCart.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(customerCart),
            });

            console.log("Cart updated.");
          }

          animateSuccess(this);
        } catch (err) {
          console.error("Error handling cart:", err);
        }

        button.dataset.isProcessing = "false";
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

  function fetchProducts() {
    fetch("http://localhost:5000/Products?isPending=false")
      .then((res) => res.json())
      .then((data) => {
        productsArray = data || [];
        filteredArray = productsArray;
        currentPage = 1;
        renderProducts(filteredArray);
        setupPagination(filteredArray);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }

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

      // Create rating container
      const ratingContainer = document.createElement("div");
      ratingContainer.className = "product-rating";
      
      // Calculate average rating (default to 0 if no ratings exist)
      const avgRating = item.averageRating || 0;
      const roundedRating = Math.round(avgRating * 10) / 10; // Round to 1 decimal place
      
      // Create stars based on average rating
      const starsContainer = document.createElement("div");
      starsContainer.className = "rating-stars";
      
      // Full stars
      const fullStars = Math.floor(avgRating);
      for (let i = 0; i < fullStars; i++) {
        const star = document.createElement("i");
        star.className = "fas fa-star filled";
        starsContainer.appendChild(star);
      }
      
      // Half star
      if (avgRating - fullStars >= 0.5) {
        const star = document.createElement("i");
        star.className = "fas fa-star-half-alt filled";
        starsContainer.appendChild(star);
      }
      
      // Empty stars
      const emptyStars = 5 - Math.ceil(avgRating);
      for (let i = 0; i < emptyStars; i++) {
        const star = document.createElement("i");
        star.className = "far fa-star";
        starsContainer.appendChild(star);
      }
      
      // Rating text
      const ratingText = document.createElement("span");
      ratingText.className = "rating-text";
      const ratingsCount = item.ratings?.length || 0;
      ratingText.textContent = ratingsCount > 0 ? `(${roundedRating})` : "(No ratings)";
      
      ratingContainer.appendChild(starsContainer);
      ratingContainer.appendChild(ratingText);

      const button = document.createElement("button");
      button.className = "add-to-cart-btn";
      button.textContent = "Add to Cart";

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(price);
      card.appendChild(ratingContainer);
      card.appendChild(button);

      container.appendChild(card);
    });

    setupAddToCartButtons();
  }

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

  function setupEventListeners() {
    categoryCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        categoryCheckboxes.forEach((cb) => {
          if (cb !== this) cb.checked = false;
        });

        const selected = Array.from(categoryCheckboxes).find(
          (cb) => cb.checked
        );
        if (!selected || selected.value === "all") {
          filteredArray = productsArray;
        } else {
          filteredArray = productsArray.filter(
            (product) =>
              product.Category.toLowerCase() === selected.value.toLowerCase()
          );
        }

        currentPage = 1;
        renderProducts(filteredArray);
        setupPagination(filteredArray);
      });
    });
  }

  function init() {
    fetchProducts();
    setupEventListeners();
  }

  window.addEventListener("load", init);
});