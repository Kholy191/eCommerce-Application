document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!loggedInUser || loggedInUser.Type !== "Customer") {
    window.location.href = "../index.html";
    return;
  }

  // Display customer name
  const customerNameElement = document.getElementById("CustomerName");
  if (customerNameElement) {
    customerNameElement.textContent = `Order History - ${loggedInUser.UserName}`;
  }

  // Fetch order history
  loadOrderHistory(loggedInUser.id);
});

async function loadOrderHistory(customerId) {
  try {
    // Fetch carts data
    const cartsResponse = await fetch("http://localhost:5000/Cart");
    const carts = await cartsResponse.json();

    // Fetch products data
    const productsResponse = await fetch(
      "http://localhost:5000/Products?isPending=false"
    );
    const products = await productsResponse.json();

    // Find the cart for this customer
    const customerCart = carts.find((cart) => cart.customerId === customerId);
    const orderHistoryList = document.getElementById("orderHistoryList");

    // Clear previous content
    orderHistoryList.innerHTML = "";

    if (!customerCart || !customerCart.orders || customerCart.orders.length === 0) {
      orderHistoryList.innerHTML =
        '<div class="no-orders">You have no orders yet.</div>';
      return;
    }

    // Filter and separate orders by status
    const draftedOrders = customerCart.orders.filter(
      (order) => order.status && order.status.toLowerCase() === "drafted"
    );
    
    const shippedOrders = customerCart.orders.filter(
      (order) => order.status && order.status.toLowerCase() === "shipped"
    );

    if (draftedOrders.length === 0 && shippedOrders.length === 0) {
      orderHistoryList.innerHTML =
        '<div class="no-orders">You have no orders.</div>';
      return;
    }

    // Create containers for both order types
    if (draftedOrders.length > 0) {
      const draftedContainer = createOrderContainer("Drafted Orders", draftedOrders, products);
      orderHistoryList.appendChild(draftedContainer);
    }

    if (shippedOrders.length > 0) {
      const shippedContainer = createOrderContainer("Shipped Orders", shippedOrders, products, customerId);
      orderHistoryList.appendChild(shippedContainer);
    }

    // Add event listeners to all star ratings
    document.querySelectorAll('.star-rating i').forEach(star => {
      star.addEventListener('click', handleStarClick);
    });

  } catch (error) {
    console.error("Error loading order history:", error);
    const orderHistoryList = document.getElementById("orderHistoryList");
    orderHistoryList.innerHTML = `
        <div class="no-orders">
          Error loading your orders. Please try again later.
          <p>${error.message}</p>
        </div>
      `;
  }
}

function createOrderContainer(title, orders, products, customerId = null) {
  const container = document.createElement("div");
  container.className = "orders-container";

  // Add section title
  const titleElement = document.createElement("h2");
  titleElement.className = "orders-section-title";
  titleElement.textContent = title;
  container.appendChild(titleElement);

  // Process each order
  let sectionTotal = 0;

  orders.forEach((order) => {
    if (!order.productId) return;

    // Find the product details
    const product = products.find((p) => p.id === order.productId);
    if (!product) return;

    const quantity = order.quantity || 1;
    const itemTotal = parseFloat(product.price) * quantity;
    sectionTotal += itemTotal;

    // Create order item element
    const orderItem = document.createElement("div");
    orderItem.className = "order-item";
    
    // Add rating section only for shipped orders
    let ratingSection = '';
    if (title === "Shipped Orders") {
      // Check if customer has already rated this product
      const customerRating = product.ratings?.find(r => r.customerId === customerId);
      const hasRated = !!customerRating;
      
      ratingSection = `
        <div class="rating-container">
          <div class="rating-title">${hasRated ? 'Your Rating:' : 'Rate this product:'}</div>
          <div class="star-rating" data-product-id="${product.id}" ${hasRated ? 'data-disabled="true"' : ''}>
            <i class="fas fa-star" data-rating="1" ${hasRated && customerRating.rating >= 1 ? 'class="fas fa-star filled"' : ''}></i>
            <i class="fas fa-star" data-rating="2" ${hasRated && customerRating.rating >= 2 ? 'class="fas fa-star filled"' : ''}></i>
            <i class="fas fa-star" data-rating="3" ${hasRated && customerRating.rating >= 3 ? 'class="fas fa-star filled"' : ''}></i>
            <i class="fas fa-star" data-rating="4" ${hasRated && customerRating.rating >= 4 ? 'class="fas fa-star filled"' : ''}></i>
            <i class="fas fa-star" data-rating="5" ${hasRated && customerRating.rating >= 5 ? 'class="fas fa-star filled"' : ''}></i>
          </div>
          ${hasRated ? `<div class="rating-message">You rated this product ${customerRating.rating} stars</div>` : ''}
        </div>
      `;
    }

    orderItem.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="order-item-img">
      <div class="order-item-details">
        <div class="order-item-name">${product.name}</div>
        <div class="order-item-price">Price: $${parseFloat(
          product.price
        ).toFixed(2)}</div>
        <div class="order-item-quantity">Quantity: ${quantity}</div>
        <div class="order-item-status">Status: ${
          order.status || "Unknown"
        }</div>
        ${ratingSection}
        <div class="order-item-total">Item Total: $${itemTotal.toFixed(2)}</div>
      </div>
    `;
    container.appendChild(orderItem);
  });

  // Add section total
  const totalElement = document.createElement("div");
  totalElement.className = "order-total";
  totalElement.innerHTML = `<strong>Section Total: $${sectionTotal.toFixed(2)}</strong>`;
  container.appendChild(totalElement);

  return container;
}

async function handleStarClick(event) {
  const star = event.target;
  const starContainer = star.parentElement;
  
  // Check if rating is disabled (already rated)
  if (starContainer.getAttribute('data-disabled') === 'true') {
    return;
  }

  const rating = parseInt(star.getAttribute('data-rating'));
  const productId = starContainer.getAttribute('data-product-id');
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  
  // Highlight selected stars
  const stars = starContainer.querySelectorAll('i');
  stars.forEach((s, index) => {
    if (index < rating) {
      s.classList.add('filled');
    } else {
      s.classList.remove('filled');
    }
  });
  
  // Disable further rating
  starContainer.setAttribute('data-disabled', 'true');
  
  // Add rating message
  const ratingContainer = starContainer.closest('.rating-container');
  const ratingMessage = document.createElement('div');
  ratingMessage.className = 'rating-message';
  ratingMessage.textContent = `You rated this product ${rating} stars`;
  ratingContainer.appendChild(ratingMessage);
  
  // Update the product rating in the database
  await updateProductRating(productId, rating, loggedInUser.id);
}

async function updateProductRating(productId, newRating, customerId) {
  try {

    const response = await fetch(`http://localhost:5000/Products/${productId}`);
    const product = await response.json();
    

    const currentRatings = product.ratings || [];
    
   
    const existingRatingIndex = currentRatings.findIndex(r => r.customerId === customerId);
    
    if (existingRatingIndex >= 0) {
   
      currentRatings[existingRatingIndex].rating = newRating;
    } else {
  
      currentRatings.push({
        customerId: customerId,
        rating: newRating,
        date: new Date().toISOString()
      });
    }
    
   
    const avgRating = calculateAverageRating(currentRatings.map(r => r.rating));
    
   
    const updateResponse = await fetch(`http://localhost:5000/Products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ratings: currentRatings,
        averageRating: avgRating
      })
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update product rating');
    }
    
    console.log('Rating updated successfully');
  } catch (error) {
    console.error('Error updating product rating:', error);
    alert('Failed to submit rating. Please try again.');
  }
}

function calculateAverageRating(ratings) {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((total, rating) => total + rating, 0);
  return sum / ratings.length;
}