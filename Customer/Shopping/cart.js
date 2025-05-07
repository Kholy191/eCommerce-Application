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
        renderCartItems(inCartItems, allProducts);
        updateCartTotals(inCartItems, allProducts);
  
      } catch (error) {
        console.error('Error fetching cart data:', error);
        showEmptyCart();
      }
    }
  
    // Render cart items
    function renderCartItems(cartItems, products) {
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
              <span>Qty: ${item.quantity}</span>
            </div>
          </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
      });
    }
  
    // Update cart totals
    function updateCartTotals(cartItems, products) {
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
          <a href="../Customer.html" class="shop-btn">Continue Shopping</a>
        </div>
      `;
      subtotalElement.textContent = '$0.00';
      totalElement.textContent = '$0.00';
      checkoutBtn.disabled = true;
    }
  
    // Proceed to checkout - update status to "Drafted"
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
  
        // Update status to "Drafted"
        const updatedOrders = userCart.orders.map(item => {
          if (item.status === "in cart") {
            return { ...item, status: "Drafted" };
          }
          return item;
        });
  
        // Update cart on server
        const updateResponse = await fetch(`http://localhost:5000/Cart/${userCart.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...userCart,
            orders: updatedOrders
          })
        });
  
        if (!updateResponse.ok) {
          throw new Error('Failed to update cart status');
        }
  
        // Success - redirect or show message
        alert('Order drafted successfully!');
        window.location.href = '/order-confirmation.html';
  
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Error during checkout. Please try again.');
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Proceed to Checkout';
      }
    });
  
    // Helper function to calculate total
    function calculateTotal(items, products) {
      return items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return product ? total + (parseFloat(product.price) * item.quantity) : total;
      }, 0);
    }
  });