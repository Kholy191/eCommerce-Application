window.addEventListener("load", function () {
  const container = document.getElementById("Products");
  const searchInput = document.getElementById("searchInput");

  if (!container || !searchInput) {
    console.error("Required elements not found!");
    return;
  }

  let productsArray = [];

  // Fetch and display all products initially
  function fetchAndDisplayProducts() {
    fetch("http://localhost:5000/Products?isPending=false")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Expected an array of products, got:", data);
          return;
        }

        productsArray = data;
        renderProducts(productsArray);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }

  // Render products to the DOM
  function renderProducts(products) {
    container.innerHTML = "";

    if (products.length === 0) {
      container.innerHTML =
        '<p class="no-products">No products found matching your criteria.</p>';
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
      button.type = "button";
      button.className = "add-to-cart-btn";
      button.textContent = "Add to Cart";

      button.addEventListener("click", () => {
        let customerId = null;
        const userStr = localStorage.getItem("loggedInUser");

        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            customerId = user.id;
          } catch (err) {
            console.error("Error parsing user from localStorage:", err);
          }
        }

        if (!customerId) {
          console.warn("Customer ID not found. Please log in.");
          return;
        }

        fetch(`http://localhost:5000/Cart?customerId=${customerId}`)
          .then((res) => res.json())
          .then((cartData) => {
            if (cartData.length > 0) {
              const customerCart = cartData[0];
              const existingOrder = customerCart.orders.find(
                (order) => order.productId === item.id
              );

              if (existingOrder) {
                existingOrder.quantity += 1;
              } else {
                customerCart.orders.push({
                  id: crypto.randomUUID(),
                  productId: item.id,
                  quantity: 1,
                });
              }

              fetch(`http://localhost:5000/Cart/${customerCart.id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(customerCart),
              })
                .then(() => {
                  animateButtonSuccess(button);
                })
                .catch((err) => {
                  console.error("Error updating cart:", err);
                });
            } else {
              const newCart = {
                customerId: customerId,
                orders: [
                  {
                    id: crypto.randomUUID(),
                    productId: item.id,
                    quantity: 1,
                  },
                ],
              };

              fetch("http://localhost:5000/Cart", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(newCart),
              })
                .then(() => {
                  animateButtonSuccess(button);
                })
                .catch((err) => {
                  console.error("Error creating cart:", err);
                });
            }
          })
          .catch((err) => {
            console.error("Error checking cart:", err);
          });
      });

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(price);
      card.appendChild(button);

      container.appendChild(card);
    });
  }

  // // Filter products based on search input
  // function filterProducts() {
  //   const searchTerm = searchInput.value.toLowerCase();

  //   if (!searchTerm) {
  //     renderProducts(productsArray);
  //     return;
  //   }

  //   const filteredProducts = productsArray.filter((item) =>
  //     item.name.toLowerCase().includes(searchTerm)
  //   );

  //   renderProducts(filteredProducts);
  // }

  // // Add event listener for search input
  // searchInput.addEventListener("input", filterProducts);

  // // Function to animate the button
  // function animateButtonSuccess(button) {
  //   const originalText = button.textContent;
  //   button.textContent = "✓ Added";
  //   button.style.backgroundColor = "#28a745"; // Green
  //   button.style.color = "#fff";

  //   setTimeout(() => {
  //     button.textContent = originalText;
  //     button.style.backgroundColor = ""; // reset
  //     button.style.color = "";
  //   }, 2000);
  // }

  // Initialize
  fetchAndDisplayProducts();
});
