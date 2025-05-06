document
  .querySelector(".sign-in-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    let isValid = true;

    // Reset errors
    emailError.style.display = "none";
    passwordError.style.display = "none";

    // Email validation
    if (!email || !email.includes("@") || !email.includes(".")) {
      emailError.style.display = "block";
      isValid = false;
    }

    // Password validation
    if (!password || password.length < 6) {
      passwordError.style.display = "block";
      isValid = false;
    }

    if (!isValid) return;

    // If validation passed, proceed to fetch
    fetch(`http://localhost:5000/Users?Email=${email}`)
      .then((res) => res.json())
      .then((users) => {
        const user = users.find(
          (u) =>
            u.Email.toLowerCase() === email.toLowerCase() &&
            u.Password === password
        );

        if (user) {
          localStorage.setItem("loggedInUser", JSON.stringify(user));
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
        console.error("Error:", err);
        alert("Something went wrong while connecting to server.");
      });
  });
