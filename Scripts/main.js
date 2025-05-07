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

// window.addEventListener("load", function () {
//   let productList = document.getElementById("product-list");
//   let searchInput = document.getElementById("Search");
//   let products = [
//     {
//       name: "Wireless Headphones",
//       price: "$59.99",
//       imageUrl: "https://picsum.photos/200?random=1",
//     },
//     {
//       name: "Smart Watch",
//       price: "$129.00",
//       imageUrl: "https://picsum.photos/200?random=2",
//     },
//     {
//       name: "Bluetooth Speaker",
//       price: "$39.90",
//       imageUrl: "https://picsum.photos/200?random=3",
//     },
//     {
//       name: "Gaming Mouse",
//       price: "$24.50",
//       imageUrl: "https://picsum.photos/200?random=4",
//     },
//     {
//       name: "Wireless Earbuds",
//       price: "$49.99",
//       imageUrl: "https://picsum.photos/200?random=5",
//     },
//     {
//       name: "4K TV",
//       price: "$799.99",
//       imageUrl: "https://picsum.photos/200?random=6",
//     },
//     {
//       name: "Smartphone",
//       price: "$499.00",
//       imageUrl: "https://picsum.photos/200?random=7",
//     },
//     {
//       name: "Laptop",
//       price: "$999.00",
//       imageUrl: "https://picsum.photos/200?random=8",
//     },
//     {
//       name: "Drone",
//       price: "$249.99",
//       imageUrl: "https://picsum.photos/200?random=9",
//     },
//     {
//       name: "Electric Scooter",
//       price: "$399.00",
//       imageUrl: "https://picsum.photos/200?random=10",
//     },
//   ];

//   // Function to create product card
//   function createProductCard(product) {
//     let productCard = document.createElement("div");
//     productCard.classList.add("product-card");

//     let productImage = document.createElement("img");
//     productImage.src = product.imageUrl;
//     productImage.alt = product.name;

//     let productName = document.createElement("h3");
//     productName.textContent = product.name;

//     let productPrice = document.createElement("p");
//     productPrice.textContent = product.price;

//     let addToCartBtn = document.createElement("button");
//     addToCartBtn.classList.add("add-to-cart-btn");
//     addToCartBtn.textContent = "Add to Cart";

//     productCard.appendChild(productImage);
//     productCard.appendChild(productName);
//     productCard.appendChild(productPrice);
//     productCard.appendChild(addToCartBtn);

//     return productCard;
//   }

//   // Function to display all products
//   function displayProducts(products) {
//     productList.innerHTML = "";
//     products.forEach((product) => {
//       let productCard = createProductCard(product);
//       productList.appendChild(productCard);
//     });
//   }

//   // Display products on load
//   displayProducts(products);

//   // Search functionality
//   searchInput.addEventListener("input", function () {
//     let query = searchInput.value.toLowerCase();
//     let filteredProducts = products.filter((product) =>
//       product.name.toLowerCase().includes(query)
//     );
//     displayProducts(filteredProducts);
//   });
// });
