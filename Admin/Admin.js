window.addEventListener("load", function () {
  let LS = localStorage.getItem("loggedInUser");

  if (LS) {
    let user = JSON.parse(LS);
    if (user.Type !== "Admin") {
      window.location.href = "/General_Logics/BadRequest/BadRequest.html";
    }
  }
});

window.addEventListener("load", function () {
  let TProducts = document.getElementById("totalProducts");

  fetch("http://localhost:5000/Products")
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        console.error("Products not found in response data");
        return;
      }
      TProducts.innerText = data.length;
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
    });
});

window.addEventListener("load", function () {
  let PProducts = document.getElementById("Pendingproducts");

  fetch("http://localhost:5000/Products?isPending=true")
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        console.error("Products not found in response data");
        return;
      }
      PProducts.innerText = data.length;
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
    });
});

window.addEventListener("load", function () {
  let Users = document.getElementById("totalUsers");

  fetch("http://localhost:5000/Users")
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        console.error("Products not found in response data");
        return;
      }
      Users.innerText = data.length;
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
    });
});
