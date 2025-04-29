window.addEventListener("load", function () {
  let AllDiv = document.getElementById("productsContainer");
  let Seller = JSON.parse(localStorage.getItem("loggedInUser"));
  let localdata = [];

  let LoadFunc = function () {
    AllDiv.innerHTML = "";
    fetch(`http://localhost:5000/Products?SellerId=${Seller.id}`)
      .then((res) => res.json())
      .then(function (_data) {
        localdata = _data;

        if (localdata.length === 0) {
          AllDiv.innerHTML = `<div class="no-products">There are no products yet.</div>`;
        } else {
          PrintingData(localdata);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        AllDiv.innerHTML = `<div class="error-message">Failed to load products.</div>`;
      });
  };

  let PrintingData = function (data) {
    data.forEach((product) => {
      AllDiv.innerHTML += `
        <div class="product-card">
          <img src="${product.image}" alt="${
        product.name
      }" class="product-image" />
          <h3>${product.name}</h3>
          <p class="product-price">${product.price} EGP</p>
          <p class="product-description">${product.description}</p>
          <p class="product-status ${
            product.isPending ? "pending" : "approved"
          }">
            ${product.isPending ? "Pending Approval" : "Approved"}
          </p>
          <div class="product-actions">
            <button class="edit-btn" onclick="editProduct('${
              product.id
            }')">Edit</button>
            <button class="remove-btn" onclick="removeProduct('${
              product.id
            }')">Remove</button>
          </div>
        </div>
      `;
    });
  };

  LoadFunc();
});

function editProduct(id) {
  localStorage.setItem("EditProduct", id);
  location.replace("./EditView/Edit.html");
}

function removeProduct(id) {
  fetch(`http://localhost:5000/Products/${id}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Delete failed");
      // Reload products after delete
      window.location.reload();
    })
    .catch((err) => {
      console.error("Error deleting product:", err);
    });
}
