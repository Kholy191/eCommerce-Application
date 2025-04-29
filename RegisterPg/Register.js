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

  if (
    !fullName ||
    !username ||
    !email ||
    !password ||
    !phone ||
    !address ||
    !userType
  ) {
    swal("Missing Info", "Please fill in all fields.", "warning");
    return;
  }

  // Check if email already exists
  fetch(`http://localhost:5000/Users?Email=${email}`)
    .then((res) => res.json())
    .then((existingUsers) => {
      if (existingUsers.length > 0) {
        swal("احا!", "الإيميل ده مستخدم قبل كده يا نجم!", "error");
        return;
      }

      const newUser = {
        id: crypto.randomUUID(),
        FullName: fullName,
        UserName: username,
        Email: email,
        Password: password,
        Phone: phone,
        Address: address,
        Type: userType.value,
      };

      // Send the new user to the server
      fetch("http://localhost:5000/Users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Registration failed.");
          return res.json();
        })
        .then((data) => {
          e.preventDefault();
          swal({
            title: "Done!",
            text: "Account Created.",
            icon: "warning", // "success"
            button: "OK",
          });
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
