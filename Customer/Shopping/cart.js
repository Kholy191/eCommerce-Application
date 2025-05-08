document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const customerNameElement = document.getElementById("CustomerName");
  const cartItemsContainer = document.getElementById("cartItems");
  const subtotalElement = document.getElementById("subtotal");
  const totalElement = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkoutBtn");

  // Get logged in user
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  // Initialize cart
  fetchCartData();

  // Update welcome message
  if (loggedInUser && customerNameElement) {
    customerNameElement.textContent = `Welcome, ${
      loggedInUser.UserName || "Customer"
    }`;
  }

  // Fetch cart data with only "in cart" items
  async function fetchCartData() {
    try {
      if (!loggedInUser) {
        showEmptyCart();
        return;
      }

      const cartResponse = await fetch("http://localhost:5000/Cart");
      const cartData = await cartResponse.json();

      const userCart = cartData.find(
        (cart) => cart.customerId === loggedInUser.id
      );
      const inCartItems =
        userCart?.orders?.filter((item) => item.status === "in cart") || [];

      if (inCartItems.length === 0) {
        showEmptyCart();
        return;
      }

      const productsResponse = await fetch("http://localhost:5000/Products");
      const allProducts = await productsResponse.json();

      renderCartItems(inCartItems, allProducts, userCart.id);
      updateCartTotals(inCartItems, allProducts);
    } catch (error) {
      console.error("Error fetching cart data:", error);
      showEmptyCart();
    }
  }

  function renderCartItems(cartItems, products, cartId) {
    cartItemsContainer.innerHTML = "";

    cartItems.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return;

      const cartItemElement = document.createElement("div");
      cartItemElement.className = "cart-item";
      cartItemElement.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h3 class="cart-item-title">${product.name}</h3>
          <p class="cart-item-price">$${parseFloat(product.price).toFixed(
            2
          )}</p>
          <div class="cart-item-quantity">
            <button class="quantity-btn minus" data-id="${item.id}">-</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn plus" data-id="${item.id}">+</button>
          </div>
          <button class="remove-btn" data-id="${item.id}">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      `;
      cartItemsContainer.appendChild(cartItemElement);
    });

    addQuantityEventListeners();
  }

  function addQuantityEventListeners() {
    document.querySelectorAll(".minus").forEach((btn) => {
      btn.addEventListener("click", function () {
        const itemId = this.getAttribute("data-id");
        updateQuantity(itemId, -1);
      });
    });

    document.querySelectorAll(".plus").forEach((btn) => {
      btn.addEventListener("click", function () {
        const itemId = this.getAttribute("data-id");
        updateQuantity(itemId, 1);
      });
    });

    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const itemId = this.getAttribute("data-id");
        removeItem(itemId);
      });
    });
  }

  async function updateQuantity(itemId, change) {
    try {
      const cartResponse = await fetch("http://localhost:5000/Cart");
      const cartData = await cartResponse.json();
      const userCart = cartData.find(
        (cart) => cart.customerId === loggedInUser.id
      );
      if (!userCart) return;

      const itemIndex = userCart.orders.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) return;

      const newQuantity = userCart.orders[itemIndex].quantity + change;
      if (newQuantity < 1) return;

      userCart.orders[itemIndex].quantity = newQuantity;

      await fetch(`http://localhost:5000/Cart/${userCart.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userCart),
      });

      fetchCartData();
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  }

  async function removeItem(itemId) {
    try {
      const cartResponse = await fetch("http://localhost:5000/Cart");
      const cartData = await cartResponse.json();
      const userCart = cartData.find(
        (cart) => cart.customerId === loggedInUser.id
      );
      if (!userCart) return;

      userCart.orders = userCart.orders.filter((item) => item.id !== itemId);

      await fetch(`http://localhost:5000/Cart/${userCart.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userCart),
      });

      fetchCartData();
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item. Please try again.");
    }
  }

  async function updateCartTotals(cartItems, products) {
    let subtotal = 0;

    cartItems.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        subtotal += parseFloat(product.price) * item.quantity;
      }
    });

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${subtotal.toFixed(2)}`;
  }

  function showEmptyCart() {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <a href="../Customer.html" class="shop-btn">Continue Shopping</a>
      </div>
    `;
    subtotalElement.textContent = "$0.00";
    totalElement.textContent = "$0.00";
    checkoutBtn.disabled = true;
  }

  // ✅ Proceed to checkout - update status to "Drafted" and decrease product quantities
  checkoutBtn.addEventListener("click", async function () {
    try {
      if (!loggedInUser) {
        alert("Please login to proceed to checkout");
        return;
      }

      const cartResponse = await fetch("http://localhost:5000/Cart");
      const cartData = await cartResponse.json();
      const userCart = cartData.find(
        (cart) => cart.customerId === loggedInUser.id
      );

      if (!userCart || !userCart.orders || userCart.orders.length === 0) {
        alert("Your cart is empty");
        return;
      }

      const inCartItems = userCart.orders.filter(
        (item) => item.status === "in cart"
      );
      if (inCartItems.length === 0) {
        alert("No items available for checkout");
        return;
      }

      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Processing...";

      const updatedOrders = userCart.orders.map((item) => {
        if (item.status === "in cart") {
          return { ...item, status: "Drafted" };
        }
        return item;
      });

      // Update cart status to Drafted
      const updateResponse = await fetch(
        `http://localhost:5000/Cart/${userCart.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...userCart,
            orders: updatedOrders,
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update cart status");
      }

      // Fetch all products
      const productsResponse = await fetch("http://localhost:5000/Products");
      const allProducts = await productsResponse.json();

      // Update product quantities
      for (const item of inCartItems) {
        const product = allProducts.find((p) => p.id === item.productId);
        if (product) {
          const updatedQuantity = product.quantity - item.quantity;
          if (updatedQuantity < 0) {
            alert(`Not enough stock for ${product.name}`);
            continue;
          }

          await fetch(`http://localhost:5000/Products/${product.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...product,
              quantity: updatedQuantity,
            }),
          });
        }
      }

      alert("Order drafted successfully!");
      window.location.href = "/order-confirmation.html";
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error during checkout. Please try again.");
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = "Proceed to Checkout";
    }
  });
});
