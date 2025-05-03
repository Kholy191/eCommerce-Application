window.addEventListener("load", function () {
  // تأكد من وجود الـ container
  const container = document.getElementById("Products");

  if (!container) {
    console.error("Container not found!");
    return;
  }

  // Array لتخزين المنتجات
  let productsArray = [];

  // جلب المنتجات من السيرفر
  fetch("http://localhost:5000/Products?isPending=false")
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        console.error("Products not found in response data");
        return;
      }

      // تخزين المنتجات في array
      productsArray = data;

      // مسح المحتوى القديم داخل الـ container
      container.innerHTML = "";

      // إضافة المنتجات إلى الـ container
      productsArray.forEach((item) => {
        const card = document.createElement("div");
        card.className = "product-card";

        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;

        const title = document.createElement("h3");
        title.textContent = item.name;

        const price = document.createElement("p");
        price.textContent = `$${parseFloat(item.price).toFixed(2)}`;

        const button = document.createElement("button");
        button.className = "add-to-cart-btn";
        button.textContent = "Add to Cart";

        // إضافة العناصر للـ product-card
        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(button);

        // إضافة الـ product-card للـ container
        container.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
    });
});

const footer = document.createElement("footer");
footer.innerHTML = `
  <p>
    © 2025 Ecommerce. All rights reserved. 
    <a href="#">Privacy Policy</a> |
    <a href="#">Terms of Service</a>
  </p>
`;

document.body.appendChild(footer);
