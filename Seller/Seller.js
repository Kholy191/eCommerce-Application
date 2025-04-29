document.addEventListener("DOMContentLoaded", function () {
  // تأكد من أن البيانات موجودة في localStorage
  const sellerData = JSON.parse(localStorage.getItem("loggedInUser"));

  // تحقق إذا كانت البيانات موجودة
  if (sellerData && sellerData.FullName) {
    // تحديث النص داخل العنصر
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
