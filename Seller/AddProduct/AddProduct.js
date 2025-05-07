const form = document.getElementById("PForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Fields
  const image = document.getElementById("productImage").value.trim();
  const name = document.getElementById("productName").value.trim();
  const price = document.getElementById("productPrice").value.trim();
  const description = document
    .getElementById("productDescription")
    .value.trim();
  const categorySelect = document.getElementById("productCategory");
  const category = categorySelect.value;

  // Error divs
  const errorElements = {
    image: document.getElementById("image-error"),
    name: document.getElementById("name-error"),
    price: document.getElementById("price-error"),
    description: document.getElementById("description-error"),
    category: document.getElementById("category-error"),
  };

  // Reset all error messages
  Object.values(errorElements).forEach((el) => {
    el.textContent = "";
    el.style.display = "none";
  });

  let isValid = true;

  if (!image) {
    errorElements.image.textContent = "Image URL is required.";
    errorElements.image.style.display = "block";
    isValid = false;
  }

  if (name.length < 3) {
    errorElements.name.textContent =
      "Product name must be at least 3 characters.";
    errorElements.name.style.display = "block";
    isValid = false;
  }

  const priceNum = parseFloat(price);
  if (!price || isNaN(priceNum) || priceNum <= 0) {
    errorElements.price.textContent = "Enter a valid positive price.";
    errorElements.price.style.display = "block";
    isValid = false;
  }

  if (description.length < 10) {
    errorElements.description.textContent =
      "Description must be at least 10 characters.";
    errorElements.description.style.display = "block";
    isValid = false;
  }

  if (!category) {
    errorElements.category.textContent = "Please select a category.";
    errorElements.category.style.display = "block";
    isValid = false;
  }

  if (!isValid) return;

  // Product creation
  const seller = JSON.parse(localStorage.getItem("loggedInUser"));
  const newProduct = {
    id: crypto.randomUUID(),
    image,
    name,
    price: priceNum,
    description,
    Category: category,
    isPending: true,
    SellerId: seller.id,
  };

  fetch("http://localhost:5000/Products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newProduct),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Product add failed.");
      return res.json();
    })
    .then(() => {
      form.reset();
    })
    .catch((err) => {
      console.error(err);
      alert("Something went wrong.");
    });
});
