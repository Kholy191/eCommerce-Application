document.addEventListener("DOMContentLoaded", function () {
  const sellerData = JSON.parse(localStorage.getItem("loggedInUser"));

  if (sellerData && sellerData.FullName) {
    const sellerNameElement = document.getElementById("sellerName");
    if (sellerNameElement) {
      sellerNameElement.textContent = `Welcome, ${sellerData.FullName}`;
    } else {
      console.error('Element with id "sellerName" not found');
    }
  } else {
    console.error("No seller data found in localStorage");
  }
});
