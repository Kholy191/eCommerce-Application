window.addEventListener("load", function () {
  let LS = localStorage.getItem("loggedInUser");

  if (LS) {
    window.location.href = "/General_Logics/BadRequest/BadRequest.html";
  }
});
