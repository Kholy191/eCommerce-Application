document.addEventListener("DOMContentLoaded", function () {
  // Get the logged in user from localStorage
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!loggedInUser) {
    swal("Error", "You need to log in first", "error").then(() => {
      window.location.href = "/login.html"; // Redirect to login if not logged in
    });
    return;
  }

  document
    .querySelector(".btn-secondary")
    .addEventListener("click", function () {
      window.history.back();
    });

  // Fetch current user data from the server
  fetch(`http://localhost:5000/Users/${loggedInUser.id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      return response.json();
    })
    .then((user) => {
      // Populate form with current user data
      document.getElementById("fullName").value = user.FullName || "";
      document.getElementById("userName").value = user.UserName || "";
      document.getElementById("email").value = user.Email || "";
      document.getElementById("phone").value = user.Phone || "";
      document.getElementById("address").value = user.Address || "";
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
      swal("Error", "Failed to load your profile data", "error");
    });

  // Handle form submission
  document
    .getElementById("updateProfileForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      // Clear previous error messages
      document
        .querySelectorAll("small.text-danger")
        .forEach((el) => (el.textContent = ""));

      // Get form values
      const formData = {
        FullName: document.getElementById("fullName").value.trim(),
        UserName: document.getElementById("userName").value.trim(),
        Email: document.getElementById("email").value.trim(),
        Phone: document.getElementById("phone").value.trim(),
        Address: document.getElementById("address").value.trim(),
        Type: loggedInUser.Type, // Preserve the user type
      };

      // Only update password if a new one was provided
      const newPassword = document.getElementById("password").value.trim();
      if (newPassword) {
        formData.Password = newPassword;
      } else {
        // Keep the existing password
        formData.Password = loggedInUser.Password;
      }

      // Form validation
      let hasError = false;

      if (formData.FullName.length < 3) {
        document.getElementById("fullNameError").textContent =
          "Full name must be at least 3 characters";
        hasError = true;
      }

      if (formData.UserName.length < 3) {
        document.getElementById("userNameError").textContent =
          "Username must be at least 3 characters";
        hasError = true;
      }

      if (!validateEmail(formData.Email)) {
        document.getElementById("emailError").textContent =
          "Invalid email address";
        hasError = true;
      }

      if (!validatePhone(formData.Phone)) {
        document.getElementById("phoneError").textContent =
          "Invalid phone number";
        hasError = true;
      }

      if (formData.Address.length < 5) {
        document.getElementById("addressError").textContent =
          "Address must be at least 5 characters";
        hasError = true;
      }

      if (newPassword && newPassword.length < 6) {
        document.getElementById("passwordError").textContent =
          "Password must be at least 6 characters";
        hasError = true;
      }

      // If there are errors, stop form submission
      if (hasError) {
        return;
      }

      // Show loading state
      const submitBtn = document.querySelector(
        '#updateProfileForm button[type="submit"]'
      );
      submitBtn.disabled = true;
      submitBtn.textContent = "Updating...";

      // Update user data on the server
      fetch(`http://localhost:5000/Users/${loggedInUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to update profile");
          }
          return response.json();
        })
        .then((updatedUser) => {
          // Update localStorage with new user data
          const updatedLoggedInUser = {
            ...loggedInUser,
            FullName: updatedUser.FullName,
            UserName: updatedUser.UserName,
            Email: updatedUser.Email,
            Phone: updatedUser.Phone,
            Address: updatedUser.Address,
          };

          if (newPassword) {
            updatedLoggedInUser.Password = newPassword;
          }

          localStorage.setItem(
            "loggedInUser",
            JSON.stringify(updatedLoggedInUser)
          );

          swal("Success", "Profile updated successfully!", "success").then(
            () => {
              window.location.href = "index.html";
            }
          );
        })
        .catch((error) => {
          console.error("Error updating profile:", error);
          swal("Error", "Failed to update profile. Please try again.", "error");
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = "Save Changes";
        });
    });

  // Helper function to validate email format
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Helper function to validate phone number (basic validation)
  function validatePhone(phone) {
    // Basic check - at least 6 digits
    return /^[0-9]{6,}$/.test(phone);
  }
});
