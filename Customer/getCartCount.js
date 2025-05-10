document.addEventListener('DOMContentLoaded', function() {
   
    function updateCartCount() {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      const cartCountElement = document.getElementById('cartCount');
      
      if (!loggedInUser) {
        cartCountElement.textContent = '0';
        return;
      }
  

      fetch('http://localhost:5000/Cart')
        .then(response => response.json())
        .then(cartData => {
          // Find the cart for the logged-in user
          const userCart = cartData.find(cart => cart.customerId === loggedInUser.id);
          
          if (userCart && userCart.orders) {
           
            const totalItems = userCart.orders.reduce((total, order) => {
            
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
  
 
    updateCartCount();
  
   
    document.addEventListener('itemAddedToCart', updateCartCount);
    document.addEventListener('cartUpdated', updateCartCount); 
});