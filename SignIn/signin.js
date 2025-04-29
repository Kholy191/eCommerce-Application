document
  .querySelector(".sign-in-form")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // يمنع الفورم من إنه يعمل ريفرش

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch(`http://localhost:5000/Users?Email=${email}`)
      .then((res) => res.json())
      .then((users) => {
        const user = users.find(
          (u) => u.Email === email && u.Password === password
        );

        if (user) {
          // تقدر تخزن البيانات دي لو عايز في localStorage
          localStorage.setItem("loggedInUser", JSON.stringify(user));

          if (user.Type === "Admin") {
            window.location.href = "/Admin/Admin.html";
          } else if (user.Type === "Seller") {
            window.location.href = "/Seller/Seller.html";
          } else {
            window.location.href = "userDashboard.html";
          }
        } else {
          alert("Invalid email or password");
        }
      })
      .catch((err) => {
        alert("Something went wrong while connecting to server.");
      });
  });
