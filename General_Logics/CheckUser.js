window.addEventListener("load", () => {
  const currentPath = window.location.pathname;

  const isPublicPage =
    currentPath.includes("index.html") ||
    currentPath.includes("signIn.html") ||
    currentPath.includes("register.html");

  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user && !isPublicPage) {
    window.location.href = "/index.html";
    return;
  }

  if (user) {
    if (user.Type === "Admin") {
      if (!currentPath.includes("/Admin/Admin.html")) {
        window.location.href = "/Admin/Admin.html";
      }
    } else if (user.Type === "Seller") {
      if (!currentPath.includes("/Seller/Seller.html")) {
        window.location.href = "/Seller/Seller.html";
      }
    } else if (user.Type === "Customer") {
      if (!currentPath.includes("/Customer/Customer.html")) {
        window.location.href = "/Customer/Customer.html";
      }
    } else if (user.Type === "user") {
      if (!currentPath.includes("/home.html")) {
        window.location.href = "/home.html";
      }
    } else {
      window.location.href = "/index.html";
    }
  }
});
