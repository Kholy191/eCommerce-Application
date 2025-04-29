document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("productList");
  
    // Fetch only pending products
    async function fetchProducts() {
      const response = await fetch("http://localhost:5000/Products");
      const products = await response.json();
      return products.filter(p => p.isPending);
    }
  
    // Approve product (mark isPending = false)
    async function approveProduct(productId) {
      await fetch(`http://localhost:5000/Products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isPending: false })
      });
    }
  
    // Reject product (delete from db)
    async function rejectProduct(productId) {
      await fetch(`http://localhost:5000/Products/${productId}`, {
        method: "DELETE"
      });
    }
  
    // Render pending products
    async function renderProducts() {
      container.innerHTML = "";
      const products = await fetchProducts();
  
      products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${product.image}" alt="${product.name}" />
          <div class="product-info">
            <h3>${product.name}</h3>
            <p><strong>Price:</strong> $${product.price}</p>
            <p>${product.description}</p>
          </div>
          <button class="approve-button" data-id="${product.id}">✅ Approve</button>
          <button class="reject-button" data-id="${product.id}">❌ Reject</button>
        `;
        container.appendChild(card);
      });
    }
  
    // Handle approve & reject clicks
    container.addEventListener("click", async (e) => {
      const productId = e.target.dataset.id;
  
      if (e.target.classList.contains("approve-button")) {
        await approveProduct(productId);
        renderProducts();
      }
  
      if (e.target.classList.contains("reject-button")) {
        await rejectProduct(productId);
        renderProducts();
      }
    });
  
    renderProducts(); // Initial load
  });
  