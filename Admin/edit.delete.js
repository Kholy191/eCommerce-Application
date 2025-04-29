document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("productList");
  
    async function fetchProducts() {
      const response = await fetch("http://localhost:5000/Products");
      return await response.json();
    }
  
    async function editProduct(productId, updatedData) {
      await fetch(`http://localhost:5000/Products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
      });
    }
  
    async function deleteProduct(productId) {
      await fetch(`http://localhost:5000/Products/${productId}`, {
        method: "DELETE"
      });
    }
  
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
          <button class="edit-button" data-id="${product.id}">✏️ Edit</button>
          <button class="delete-button" data-id="${product.id}">🗑️ Delete</button>
        `;
        container.appendChild(card);
      });
    }
  
    container.addEventListener("click", async (e) => {
      const productId = e.target.dataset.id;
  
      if (e.target.classList.contains("edit-button")) {
        const newName = prompt("New product name:");
        const newPrice = prompt("New price:");
        const newDesc = prompt("New description:");
  
        if (newName && newPrice && newDesc) {
          await editProduct(productId, {
            name: newName,
            price: newPrice,
            description: newDesc
          });
          renderProducts();
        }
      }
  
      if (e.target.classList.contains("delete-button")) {
        if (confirm("Are you sure you want to delete this product?")) {
          await deleteProduct(productId);
          renderProducts();
        }
      }
    });
  
    renderProducts();
  });
  