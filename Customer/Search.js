// Product Search and Filter Functionality
document.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById("Products");
    // Target the search input by its placeholder instead of ID
    const searchInput = document.querySelector('input[placeholder="Search products..."]');
  
    if (!container || !searchInput) {
      console.error("Required elements not found! Make sure you have a Products container and search input");
      return;
    }
    
    console.log("Search elements found:", { container, searchInput });
  
    let productsArray = [];
  
    // Fetch and display all products initially
    function fetchAndDisplayProducts() {
      fetch("http://localhost:5000/Products?isPending=false")
        .then((res) => res.json())
        .then((data) => {
          if (!Array.isArray(data)) {
            console.error("Expected an array of products, got:", data);
            return;
          }
  
          productsArray = data;
          renderProducts(productsArray);
          console.log(`Loaded ${productsArray.length} products`);
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
        });
    }
  
    // Render products to the DOM
    function renderProducts(products) {
      container.innerHTML = "";
  
      if (products.length === 0) {
        container.innerHTML =
          '<p class="no-products">No products found matching your criteria.</p>';
        return;
      }
  
      products.forEach((item) => {
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
        button.type = "button";
        button.className = "add-to-cart-btn";
        button.textContent = "Add to Cart";
  
        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(button);
  
        container.appendChild(card);
      });
    }
  
    // Filter products based on search input
    function filterProducts() {
      const searchTerm = searchInput.value.toLowerCase().trim();
      console.log("Filtering products with search term:", searchTerm);
  
      if (!searchTerm) {
        renderProducts(productsArray);
        return;
      }
  
      const filteredProducts = productsArray.filter((item) =>
        item.name.toLowerCase().includes(searchTerm)
      );
  
      console.log(`Found ${filteredProducts.length} products matching "${searchTerm}"`);
      renderProducts(filteredProducts);
    }
  
    // Add event listener for search input with debounce for better performance
    let debounceTimer;
    searchInput.addEventListener("input", function() {
      console.log("Search input changed:", this.value);
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(filterProducts, 300); // 300ms debounce
    });
    
    // Also handle form submission
    const searchForm = searchInput.closest('form');
    if (searchForm) {
      searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        filterProducts();
      });
    }
  
    // Initialize
    fetchAndDisplayProducts();
    console.log("Search functionality initialized");
});