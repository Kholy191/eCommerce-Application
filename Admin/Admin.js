window.addEventListener("load", function () {
  let LS = localStorage.getItem("loggedInUser");

  if (LS) {
    let user = JSON.parse(LS);
    if (user.Type !== "Admin") {
      window.location.href = "/General_Logics/BadRequest/BadRequest.html";
    }
  }
});
