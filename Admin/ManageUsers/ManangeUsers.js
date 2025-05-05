window.addEventListener("load", function () {
  let LS = localStorage.getItem("loggedInUser");

  if (LS) {
    let user = JSON.parse(LS);
    if (user.Type !== "Admin") {
      window.location.href = "/General_Logics/BadRequest/BadRequest.html";
    }
  }
});

//Statistics
window.addEventListener("load", function () {
  let Users = document.getElementById("TotalUsers");

  fetch("http://localhost:5000/Users")
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        console.error("Users not found in response data");
        return;
      }
      Users.innerText = data.length;
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
    });
});

window.addEventListener("load", function () {
  let Users = document.getElementById("Customers");

  fetch("http://localhost:5000/Users?Type=Customer")
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        console.error("Users not found in response data");
        return;
      }
      Users.innerText = data.length;
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
    });
});

window.addEventListener("load", function () {
  let Users = document.getElementById("Seller");

  fetch("http://localhost:5000/Users?Type=Seller")
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        console.error("Users not found in response data");
        return;
      }
      Users.innerText = data.length;
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
    });
});

// Loading Users
window.addEventListener("load", function () {
  let AllUsers;
  let RowsNum = this.document.getElementById("RowsNum");
  fetch("http://localhost:5000/Users")
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        console.error("Users not found in response data");
        return;
      }
      AllUsers = data;
      RowsNum.innerText = `Showing 5 of ${AllUsers.length}`;
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
    });
});
