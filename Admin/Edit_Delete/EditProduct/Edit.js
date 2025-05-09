let Name = document.getElementById("productName");
let Price = document.getElementById("productPrice");
let Description = document.getElementById("productDescription");
let Image = document.getElementById("productImage");
let ConfirmBtn = document.getElementById("ConfirmBtn");
let id;

window.addEventListener("load", function () {
  id = localStorage.getItem("EditProduct");
  fetch(`http://localhost:5000/Products?id=${id}`)
    .then((res) => res.json())
    .then(function (_data) {
      if (_data && _data[0]) {
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
  const newName = Name.value.trim();
  const newPrice = Price.value.trim();
  const newDescription = Description.value.trim();
  const newImage = Image.value.trim();

  if (
    newName !== "" &&
    newName !== Name.defaultValue &&
    newPrice !== "" &&
    newPrice !== Price.defaultValue &&
    newDescription !== "" &&
    newDescription !== Description.defaultValue &&
    newImage !== "" &&
    newImage !== Image.defaultValue
  ) {
    fetch(`http://localhost:5000/Products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: newImage,
        name: newName,
        price: newPrice,
        description: newDescription,
        isPending: true,
      }),
    })
      .then((response) => {
        if (response.ok) {
          swal({
            title: "Done!",
            text: "Updated Succesfully",
            icon: "warning",
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
  } else {
    alert("No changes were made.");
  }
});
