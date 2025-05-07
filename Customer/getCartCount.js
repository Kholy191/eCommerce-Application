document.addEventListener('DOMContentLoaded', function() {
    // Function to update cart count (only counts "in cart" items)
    function updateCartCount() {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      const cartCountElement = document.getElementById('cartCount');
      
      if (!loggedInUser) {
        cartCountElement.textContent = '0';
        return;
      }
  
      // Fetch cart data
      fetch('http://localhost:5000/Cart')
        .then(response => response.json())
        .then(cartData => {
          // Find the cart for the logged-in user
          const userCart = cartData.find(cart => cart.customerId === loggedInUser.id);
          
          if (userCart && userCart.orders) {
            // Calculate total quantity of only "in cart" items
            const totalItems = userCart.orders.reduce((total, order) => {
              // Only count if status is "in cart"
              return order.status === "in cart" ? total + order.quantity : total;
            }, 0);
            
            cartCountElement.textContent = totalItems.toString();
          } else {
            cartCountElement.textContent = '0';
          }
        })
        .catch(error => {
          console.error('Error fetching cart data:', error);
          cartCountElement.textContent = '0';
        });
    }
  
    // Initial update
    updateCartCount();
  
    // Update when cart changes
    document.addEventListener('itemAddedToCart', updateCartCount);
    document.addEventListener('cartUpdated', updateCartCount); // Add this for other cart updates
});