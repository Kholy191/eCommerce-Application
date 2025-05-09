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
    customerNameElement.textContent = `Draft Orders - ${loggedInUser.UserName}`;
  }
  
  // Load draft orders
  loadDraftOrders(loggedInUser.id);
});

async function loadDraftOrders(customerId) {
  try {
    const orderHistoryList = document.getElementById('orderHistoryList');
    orderHistoryList.innerHTML = '<div class="loading">Loading your draft orders...</div>';
    
    // Fetch cart data
    const response = await fetch('http://localhost:5000/Cart');
    if (!response.ok) throw new Error('Failed to fetch cart data');
    const carts = await response.json();
    
    // Find customer's cart
    const customerCart = carts.find(cart => cart.customerId === customerId);
    
    if (!customerCart || !customerCart.orders || customerCart.orders.length === 0) {
      orderHistoryList.innerHTML = '<div class="no-orders">You have no draft orders.</div>';
      return;
    }
    
    // Filter only drafted orders
    const draftedOrders = customerCart.orders.filter(order => 
      order.status && order.status.toLowerCase() === "drafted"
    );
    
    if (draftedOrders.length === 0) {
      orderHistoryList.innerHTML = '<div class="no-orders">You have no draft orders.</div>';
      return;
    }
    
    // Fetch products
    const productsResponse = await fetch('http://localhost:5000/Products?isPending=false');
    if (!productsResponse.ok) throw new Error('Failed to fetch products');
    const products = await productsResponse.json();
    
    // Clear loading message
    orderHistoryList.innerHTML = '';
    
    // Create container for all draft orders
    const container = document.createElement('div');
    container.className = 'draft-orders-container';
    
    // Add each drafted order
    draftedOrders.forEach(order => {
      const product = products.find(p => p.id === order.productId);
      if (!product) return;
      
      const orderElement = document.createElement('div');
      orderElement.className = 'draft-order';
      
      const quantity = order.quantity || 1;
      const total = (parseFloat(product.price) * quantity).toFixed(2);
      
      orderElement.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="draft-order-img">
        <div class="draft-order-details">
          <h3>${product.name}</h3>
          <p>Price: $${parseFloat(product.price).toFixed(2)}</p>
          <p>Quantity: ${quantity}</p>
          <p>Status: <span class="draft-status">Drafted</span></p>
          <p>Total: $${total}</p>
        </div>
      `;
      
      container.appendChild(orderElement);
    });
    
    orderHistoryList.appendChild(container);
    
  } catch (error) {
    console.error('Error loading draft orders:', error);
    const orderHistoryList = document.getElementById('orderHistoryList');
    orderHistoryList.innerHTML = `
      <div class="error">
        Error loading draft orders. Please try again later.
      </div>
    `;
  }
}