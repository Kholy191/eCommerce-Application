let Name = document.getElementById("productName");
let Price = document.getElementById("productPrice");
let Description = document.getElementById("productDescription");
let Image = document.getElementById("productImage");
let ConfirmBtn = document.getElementById("ConfirmBtn");
let id;
let OldValues;
window.addEventListener("load", function () {
  id = localStorage.getItem("EditProduct");

  fetch(`http://localhost:5000/Products?id=${id}`)
    .then((res) => res.json())
    .then(function (_data) {
      if (_data && _data[0]) {
        OldValues = _data;
        Name.value = _data[0].name;
        Price.value = parseFloat(_data[0].price) || 0;
        Description.value = _data[0].description;
        Image.value = _data[0].image;
      }
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      document.body.innerHTML = `<div class="error-message">Failed to load product data.</div>`;
    });
});

ConfirmBtn.addEventListener("click", function () {
  clearErrors();

  const newName = Name.value.trim();
  const newPrice = Price.value.trim();
  const newDescription = Description.value.trim();
  const newImage = Image.value.trim();

  let isValid = true;

  if (newName === "") {
    showError("nameError", "Please enter a product name.");
    isValid = false;
  }

  if (newPrice === "" || isNaN(newPrice) || parseFloat(newPrice) <= 0) {
    showError("priceError", "Enter a valid price greater than 0.");
    isValid = false;
  }

  if (newDescription === "") {
    showError("descriptionError", "Please enter a description.");
    isValid = false;
  }

  if (newImage === "") {
    showError("imageError", "Please enter an image URL.");
    isValid = false;
  }

  if (!isValid) return;

  fetch(`http://localhost:5000/Products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: newImage,
      name: newName,
      price: newPrice,
      description: newDescription,
      isPending: true,
      SellerId: OldValues[0].SellerId,
      Category: OldValues[0].Category,
      quantity: OldValues[0].quantity,
      Rating: OldValues[0].Rating,
    }),
  })
    .then((response) => {
      if (response.ok) {
        swal({
          title: "Done!",
          text: "Updated Successfully",
          icon: "success",
          button: "OK",
        });
      } else {
        response.text().then((text) => {
          console.error("Error response:", text);
          alert("Failed to update product.");
        });
      }
    })
    .catch((err) => {
      console.error("Error updating product:", err);
      alert("Failed to update product.");
    });
});

function showError(id, message) {
  document.getElementById(id).textContent = message;

  const inputField = id.replace("Error", "");
  const element = document.getElementById(inputField);
  if (element) element.classList.add("error");
}

function clearErrors() {
  ["nameError", "priceError", "descriptionError", "imageError"].forEach(
    (id) => {
      document.getElementById(id).textContent = "";
      const inputField = id.replace("Error", "");
      const element = document.getElementById(inputField);
      if (element) element.classList.remove("error");
    }
  );
}
