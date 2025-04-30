window.addEventListener("load", function () {
    const container = document.getElementById("Products");
  
    if (!container) {
      console.error("Container not found!");
      return;
    }
  
    let productsArray = [];
  
    fetch("http://localhost:5000/Products?isPending=false")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Expected an array of products, got:", data);
          return;
        }
  
        productsArray = data;
        container.innerHTML = "";
  
        productsArray.forEach((item) => {
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
          button.className = "add-to-cart-btn";
          button.textContent = "Add to Cart";
  
          button.addEventListener("click", () => {
            // ✅ Set or get the CustomerId from local storage
            let customerId = localStorage.getItem("CustomerId");
  
            if (!customerId) {
              customerId = crypto.randomUUID(); // generate a unique ID if not set
              localStorage.setItem("CustomerId", customerId);
            }
  
            // First, check if this product is already in the cart
            fetch(`http://localhost:5000/Cart?CustomerId=${customerId}&ProductId=${item.id}`)
              .then((res) => res.json())
              .then((cartItems) => {
                if (Array.isArray(cartItems) && cartItems.length > 0) {
                  // Item exists, update quantity
                  const existingItem = cartItems[0];
                  fetch(`http://localhost:5000/Cart/${existingItem.id}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      quantity: existingItem.quantity + 1,
                    }),
                  })
                    .then(() => {
                      swal({
                        title: "Updated!",
                        text: "Cart quantity updated.",
                        icon: "success",
                        button: "OK",
                      });
                    })
                    .catch((err) => {
                      console.error("Error updating quantity:", err);
                      swal({
                        title: "Error",
                        text: "Could not update cart. Try again.",
                        icon: "error",
                        button: "OK",
                      });
                    });
                } else {
                  // Item not in cart, add new entry
                  fetch("http://localhost:5000/Cart", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      CustomerId: customerId,
                      ProductId: item.id,
                      quantity: 1,
                    }),
                  })
                    .then(() => {
                      swal({
                        title: "Success!",
                        text: "Product added to cart.",
                        icon: "success",
                        button: "OK",
                      });
                    })
                    .catch((err) => {
                      console.error("Error adding to cart:", err);
                      swal({
                        title: "Error",
                        text: "Could not add to cart. Try again.",
                        icon: "error",
                        button: "OK",
                      });
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
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  });
  