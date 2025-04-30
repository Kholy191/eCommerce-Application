document
  .querySelector(".sign-in-form")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // Prevents the form from refreshing the page

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Make sure the server is running and the API endpoint is correct
    fetch(`http://localhost:5000/Users?Email=${email}`)
      .then((res) => res.json())
      .then((users) => {
        // Find the user with matching email and password (case insensitive comparison)
        const user = users.find(
          (u) =>
            u.Email.toLowerCase() === email.toLowerCase() && u.Password === password
        );

        if (user) {
          // Store the user data in localStorage if found
          localStorage.setItem("loggedInUser", JSON.stringify(user));
          console.log(localStorage.getItem("loggedInUser")); // Log the data for debugging

          // Redirect based on user type
          if (user.Type === "Admin") {
            window.location.href = "/Admin/Admin.html";
          } else if (user.Type === "Seller") {
            window.location.href = "/Seller/Seller.html";
          } else if (user.Type === "Customer") {
            window.location.href = "/Customer/Customer.html";
          } else {
            window.location.href = "userDashboard.html";
          }
        } else {
          alert("Invalid email or password");
        }
      })
      .catch((err) => {
        console.error("Error:", err); // Log detailed error message for debugging
        alert("Something went wrong while connecting to server.");
      });
  });
