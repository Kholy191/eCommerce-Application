document.getElementById("signOutBtn").addEventListener("click", function (e) {
  e.preventDefault(); // ضروري لو الزر جوا form
  localStorage.clear();
  location.replace("/index.html");
});
