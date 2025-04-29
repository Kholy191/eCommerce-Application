window.addEventListener("load", () => {
  const currentPath = window.location.pathname;

  // إذا كان المستخدم مسجل بالفعل، لا يستطيع الوصول لصفحات التسجيل
  const isPublicPage =
    currentPath.includes("index.html") ||
    currentPath.includes("signIn.html") ||
    currentPath.includes("register.html");

  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  // إذا لم يوجد مستخدم في Local Storage و الصفحة ليست صفحة عامة (signIn, register)، يتم توجيه المستخدم إلى صفحة تسجيل الدخول
  if (!user && !isPublicPage) {
    window.location.href = "/index.html";
    return;
  }

  // إذا كان هناك مستخدم، نقوم بتوجيهه بناءً على نوعه
  if (user) {
    // إذا كان Admin نوجهه لصفحة الادمن
    if (user.Type === "Admin") {
      if (!currentPath.includes("/Admin/Admin.html")) {
        window.location.href = "/Admin/Admin.html";
      }
    } else if (user.Type === "Seller") {
      if (!currentPath.includes("/Seller/Seller.html")) {
        window.location.href = "/Seller/Seller.html";
      }
    }
    // إذا كان User نوجهه للصفحة الرئيسية
    else if (user.Type === "user") {
      if (!currentPath.includes("/home.html")) {
        window.location.href = "/home.html";
      }
    }
    // أي نوع آخر نرجع لصفحة التسجيل
    else {
      window.location.href = "/index.html";
    }
  }
});
