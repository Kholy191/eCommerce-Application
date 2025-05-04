// Add to Cart Functionality
document.addEventListener("DOMContentLoaded", function() {
    // Function to handle adding products to cart
    function setupAddToCartButtons() {
      // Get all add to cart buttons (will work once products are loaded)
      const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
      
      addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
          const productCard = this.closest('.product-card');
          const productId = productCard.dataset.productId;
          
          // Get customer ID from localStorage
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
            // Alert user to log in if not logged in
            alert("Please log in to add items to your cart");
            return;
          }
  
          // Check if customer has a cart
          fetch(`http://localhost:5000/Cart?customerId=${customerId}`)
            .then((res) => res.json())
            .then((cartData) => {
              if (cartData.length > 0) {
                // Update existing cart
                const customerCart = cartData[0];
                const existingOrder = customerCart.orders.find(
                  (order) => order.productId === productId
                );
  
                if (existingOrder) {
                  existingOrder.quantity += 1;
                } else {
                  customerCart.orders.push({
                    id: crypto.randomUUID(),
                    productId: productId,
                    quantity: 1,
                  });
                }
  
                // Send updated cart to server
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
                // Create new cart for customer
                const newCart = {
                  customerId: customerId,
                  orders: [
                    {
                      id: crypto.randomUUID(),
                      productId: productId,
                      quantity: 1,
                    },
                  ],
                };
  
                // Send new cart to server
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
      });
    }
  
    // Function to animate the button when product is added
    function animateButtonSuccess(button) {
      const originalText = button.textContent;
      button.textContent = "✓ Added";
      button.style.backgroundColor = "#28a745"; // Green
      button.style.color = "#fff";
  
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = ""; // reset
        button.style.color = "";
      }, 2000);
    }
  
    // Set up a mutation observer to watch for product cards being added to the DOM
    const productsContainer = document.getElementById('Products');
    if (productsContainer) {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            setupAddToCartButtons();
          }
        });
      });
  
      observer.observe(productsContainer, { childList: true });
    }
  
    // Initial setup in case products are already loaded
    setupAddToCartButtons();
  });