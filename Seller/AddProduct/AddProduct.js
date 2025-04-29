const form = document.getElementById("PForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const image = document.getElementById("productImage").value.trim();
  const name = document.getElementById("productName").value.trim();
  const price = document.getElementById("productPrice").value.trim();
  const description = document
    .getElementById("productDescription")
    .value.trim();

  if (!image || !name || !price || !description) {
    swal("Missing Info", "Please fill in all fields.", "warning");
    return;
  }
  let Seller = JSON.parse(localStorage.getItem("loggedInUser"));
  const newProduct = {
    id: crypto.randomUUID(),
    image,
    name,
    price,
    description,
    isPending: true,
    SellerId: Seller.id,
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
      swal("Done!", "Product submitted for review.", "success");
      form.reset();
    })
    .catch((err) => {
      console.error(err);
      swal("Error", "Something went wrong. Please try again.", "error");
    });
});
