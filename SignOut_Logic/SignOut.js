document.getElementById("signOutBtn").addEventListener("click", function (e) {
  e.preventDefault();
  localStorage.clear();
  location.replace("/index.html");
});
