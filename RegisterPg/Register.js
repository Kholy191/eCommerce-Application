const form = document.getElementById("registerForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const fullName = document.getElementById("name").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const userType = document.querySelector('input[name="userType"]:checked');

  let isValid = true;

  // Reset errors
  document
    .querySelectorAll(".error-message")
    .forEach((el) => el.classList.remove("show"));

  // Full name: only letters and spaces
  if (!/^[A-Za-z\s]+$/.test(fullName)) {
    document.getElementById("name-error").classList.add("show");
    isValid = false;
  }

  // Username: at least 3 characters
  if (username.length < 3) {
    document.getElementById("username-error").classList.add("show");
    isValid = false;
  }

  // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById("email-error").classList.add("show");
    isValid = false;
  }

  // Password strength: at least 8 characters, with upper, lower, digit
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    document.getElementById("password-error").classList.add("show");
    isValid = false;
  }

  // Phone: digits only, 10-15
  if (!/^\d{10,15}$/.test(phone)) {
    document.getElementById("phone-error").classList.add("show");
    isValid = false;
  }

  // Address: not empty
  if (address.length < 3) {
    document.getElementById("address-error").classList.add("show");
    isValid = false;
  }

  // User type
  if (!userType) {
    document.getElementById("userType-error").classList.add("show");
    isValid = false;
  }

  if (!isValid) return;

  // Check if email already exists
  fetch(`http://localhost:5000/Users?Email=${email}`)
    .then((res) => res.json())
    .then((existingUsers) => {
      if (existingUsers.length > 0) {
        swal("Oops!", "This email already exists.", "warning");
        return;
      }
      const today = new Date();

      const newUser = {
        id: crypto.randomUUID(),
        FullName: fullName,
        UserName: username,
        Email: email,
        Password: password,
        Phone: phone,
        Address: address,
        Type: userType.value,
        Date: today.toDateString(),
      };

      fetch("http://localhost:5000/Users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Registration failed.");
          return res.json();
        })
        .then(() => {
          window.location.href = "/SignIn/Signin.html";
        })
        .catch((err) => {
          console.error(err);
          swal("Error", "Something went wrong. Please try again.", "error");
        });
    })
    .catch((err) => {
      console.error(err);
      swal("Error", "Could not check email existence.", "error");
    });
});
