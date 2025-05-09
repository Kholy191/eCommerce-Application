// main.js

// Get the Sign In button by its ID
const signInButton = document.getElementById("SignBtn");
// Add a click event listener to the button
signInButton.addEventListener("click", function () {
  // Redirect the user to the Sign In page
  window.location.href = "/SignIn/Signin.html";
});

// main.js

// Get the Register button by its ID
const registerButton = document.getElementById("RegisterBtn");

// Add a click event listener to the button
registerButton.addEventListener("click", function () {
  // Redirect the user to the Register page
  window.location.href = "/RegisterPg/Register.html";
});

window.addEventListener("load", () => {
  // نستنّى شوية لحد ما الكروت تتعرض
  setTimeout(() => {
    const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");

    addToCartBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));

        if (!user) {
          swal({
            title: "Oops!",
            text: "You need to login to add items to cart.",
            icon: "warning",
            button: "OK",
          });
        } else {
          swal({
            title: "Good!",
            text: "Product Added Successfully",
            icon: "success",
            button: "OK",
          });
        }
      });
    });
  }, 500);
});
