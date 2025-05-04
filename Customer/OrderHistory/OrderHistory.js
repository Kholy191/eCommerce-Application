// OrderHistory.js - Corrected Version

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  
  if (!loggedInUser || loggedInUser.Type !== 'Customer') {
      window.location.href = '../index.html';
      return;
  }
  
  // Display customer name
  const customerNameElement = document.getElementById('CustomerName');
  if (customerNameElement) {
      customerNameElement.textContent = `Order History - ${loggedInUser.UserName}`;
  }
  
  // Fetch order history
  loadOrderHistory(loggedInUser.id);
});

async function loadOrderHistory(customerId) {
  try {
      // Fetch carts data
      const cartsResponse = await fetch('http://localhost:5000/Cart');
      const carts = await cartsResponse.json();
      
      // Fetch products data
      const productsResponse = await fetch('http://localhost:5000/Products?isPending=false');
      const products = await productsResponse.json();
      
      // Find the cart for this customer
      const customerCart = carts.find(cart => cart.customerId === customerId);
      const orderHistoryList = document.getElementById('orderHistoryList');
      
      // Clear previous content
      orderHistoryList.innerHTML = '';
      
      if (!customerCart || !customerCart.orders || customerCart.orders.length === 0) {
          orderHistoryList.innerHTML = '<div class="no-orders">You have no orders yet.</div>';
          return;
      }
      
      // Create a container for all orders
      const ordersContainer = document.createElement('div');
      ordersContainer.className = 'orders-container';
      
      // Process each order item
      let hasValidOrders = false;
      let totalAmount = 0;
      
      customerCart.orders.forEach(order => {
          if (!order.productId) return;
          
          // Find the product details
          const product = products.find(p => p.id === order.productId);
          if (!product) return;
          
          hasValidOrders = true;
          const quantity = order.quantity || 1;
          const itemTotal = parseFloat(product.price) * quantity;
          totalAmount += itemTotal;
          
          // Create order item element
          const orderItem = document.createElement('div');
          orderItem.className = 'order-item';
          orderItem.innerHTML = `
              <img src="${product.image}" alt="${product.name}" class="order-item-img">
              <div class="order-item-details">
                  <div class="order-item-name">${product.name}</div>
                  <div class="order-item-price">Price: $${parseFloat(product.price).toFixed(2)}</div>
                  <div class="order-item-quantity">Quantity: ${quantity}</div>
                  <div class="order-item-total">Total: $${itemTotal.toFixed(2)}</div>
              </div>
          `;
          ordersContainer.appendChild(orderItem);
      });
      
      if (!hasValidOrders) {
          orderHistoryList.innerHTML = '<div class="no-orders">You have no valid orders.</div>';
          return;
      }
      
      // Add total amount
      const totalElement = document.createElement('div');
      totalElement.className = 'order-total';
      totalElement.innerHTML = `<strong>Grand Total: $${totalAmount.toFixed(2)}</strong>`;
      ordersContainer.appendChild(totalElement);
      
      // Add to the page
      orderHistoryList.appendChild(ordersContainer);
      
  } catch (error) {
      console.error('Error loading order history:', error);
      const orderHistoryList = document.getElementById('orderHistoryList');
      orderHistoryList.innerHTML = `
          <div class="no-orders">
              Error loading your order history. Please try again later.
              <p>${error.message}</p>
          </div>
      `;
  }
}