document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const customerNameElement = document.getElementById('CustomerName');
  const cartItemsContainer = document.getElementById('cartItems');
  const subtotalElement = document.getElementById('subtotal');
  const totalElement = document.getElementById('total');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Get logged in user
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  // Initialize cart
  fetchCartData();

  // Update welcome message
  if (loggedInUser && customerNameElement) {
    customerNameElement.textContent = `Welcome, ${loggedInUser.UserName || 'Customer'}`;
  }

  // Fetch cart data with only "in cart" items
  async function fetchCartData() {
    try {
      if (!loggedInUser) {
        showEmptyCart();
        return;
      }

      // Fetch cart data
      const cartResponse = await fetch('http://localhost:5000/Cart');
      const cartData = await cartResponse.json();
      
      // Find user's cart and filter only "in cart" items
      const userCart = cartData.find(cart => cart.customerId === loggedInUser.id);
      const inCartItems = userCart?.orders?.filter(item => item.status === "in cart") || [];

      if (inCartItems.length === 0) {
        showEmptyCart();
        return;
      }

      // Fetch product details
      const productsResponse = await fetch('http://localhost:5000/Products');
      const allProducts = await productsResponse.json();

      // Render cart items
      renderCartItems(inCartItems, allProducts, userCart.id);
      updateCartTotals(inCartItems, allProducts);

    } catch (error) {
      console.error('Error fetching cart data:', error);
      showEmptyCart();
    }
  }

  // Render cart items with quantity adjustment buttons
  function renderCartItems(cartItems, products, cartId) {
    cartItemsContainer.innerHTML = '';

    cartItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      const cartItemElement = document.createElement('div');
      cartItemElement.className = 'cart-item';
      cartItemElement.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h3 class="cart-item-title">${product.name}</h3>
          <p class="cart-item-price">$${parseFloat(product.price).toFixed(2)}</p>
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

    // Add event listeners for quantity buttons
    addQuantityEventListeners();
  }

  // Add event listeners for quantity adjustment
  function addQuantityEventListeners() {
    // Quantity decrease buttons
    document.querySelectorAll('.minus').forEach(btn => {
      btn.addEventListener('click', function() {
        const itemId = this.getAttribute('data-id');
        updateQuantity(itemId, -1);
      });
    });

    // Quantity increase buttons
    document.querySelectorAll('.plus').forEach(btn => {
      btn.addEventListener('click', function() {
        const itemId = this.getAttribute('data-id');
        updateQuantity(itemId, 1);
      });
    });

    // Remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const itemId = this.getAttribute('data-id');
        removeItem(itemId);
      });
    });
  }

  // Update item quantity
  async function updateQuantity(itemId, change) {
    try {
      // Get current cart
      const cartResponse = await fetch('http://localhost:5000/Cart');
      const cartData = await cartResponse.json();
      const userCart = cartData.find(cart => cart.customerId === loggedInUser.id);

      if (!userCart) return;

      // Find the item to update
      const itemIndex = userCart.orders.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return;

      // Calculate new quantity
      const newQuantity = userCart.orders[itemIndex].quantity + change;
      
      // Don't allow quantity less than 1 (use remove instead)
      if (newQuantity < 1) return;

      // Update the quantity
      userCart.orders[itemIndex].quantity = newQuantity;

      // Update on server
      await fetch(`http://localhost:5000/Cart/${userCart.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userCart)
      });

      // Refresh cart display
      fetchCartData();

    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  }

  // Remove item completely
  async function removeItem(itemId) {
    try {
      // Get current cart
      const cartResponse = await fetch('http://localhost:5000/Cart');
      const cartData = await cartResponse.json();
      const userCart = cartData.find(cart => cart.customerId === loggedInUser.id);

      if (!userCart) return;

      // Remove the item
      userCart.orders = userCart.orders.filter(item => item.id !== itemId);

      // Update on server
      await fetch(`http://localhost:5000/Cart/${userCart.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userCart)
      });

      // Refresh cart display
      fetchCartData();

    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    }
  }

  // Update cart totals
  async function updateCartTotals(cartItems, products) {
    let subtotal = 0;

    cartItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        subtotal += parseFloat(product.price) * item.quantity;
      }
    });

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${subtotal.toFixed(2)}`;
  }

  // Show empty cart message
  function showEmptyCart() {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <a href="index.html" class="shop-btn">Continue Shopping</a>
      </div>
    `;
    subtotalElement.textContent = '$0.00';
    totalElement.textContent = '$0.00';
    checkoutBtn.disabled = true;
  }

  // Proceed to checkout - update status of cart items to "drafted"
  checkoutBtn.addEventListener('click', async function() {
    try {
      if (!loggedInUser) {
        alert('Please login to proceed to checkout');
        return;
      }

      // Get current cart
      const cartResponse = await fetch('http://localhost:5000/Cart');
      const cartData = await cartResponse.json();
      const userCart = cartData.find(cart => cart.customerId === loggedInUser.id);

      if (!userCart || !userCart.orders || userCart.orders.length === 0) {
        alert('Your cart is empty');
        return;
      }

      // Filter only "in cart" items
      const inCartItems = userCart.orders.filter(item => item.status === "in cart");

      if (inCartItems.length === 0) {
        alert('No items available for checkout');
        return;
      }

      // Show processing state
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Processing...';

      // Update the status of each item to "drafted"
      userCart.orders = userCart.orders.map(item => {
        if (item.status === "in cart") {
          return { ...item, status: "drafted" };
        }
        return item;
      });

      // Update the cart on server
      await fetch(`http://localhost:5000/Cart/${userCart.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userCart)
      });

      // Update product quantities
      const productsResponse = await fetch('http://localhost:5000/Products');
      const allProducts = await productsResponse.json();

      for (const item of inCartItems) {
        const product = allProducts.find(p => p.id === item.productId);
        if (product) {
          const updatedQuantity = parseInt(product.Quantity) - item.quantity;
          if (updatedQuantity < 0) {
            alert(`Not enough stock for ${product.name}`);
            continue;
          }

          await fetch(`http://localhost:5000/Products/${product.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...product,
              Quantity: updatedQuantity.toString()
            })
          });
        }
      }

      // Success - redirect or show message
      alert('Order processed successfully! Your items are now in draft status.');
      window.location.href = '/order-confirmation.html';

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error during checkout. Please try again.');
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = 'Proceed to Checkout';
    }
  });
});