window.addEventListener("load", function () {
  let LS = localStorage.getItem("loggedInUser");

  if (LS) {
    let user = JSON.parse(LS);
    if (user.Type !== "Admin") {
      window.location.href = "/General_Logics/BadRequest/BadRequest.html";
    }
  }
});

//Statistics
window.addEventListener("load", function () {
  let Users = document.getElementById("TotalUsers");

  fetch("http://localhost:5000/Users")
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        console.error("Users not found in response data");
        return;
      }
      Users.innerText = data.length;
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
    });
});

window.addEventListener("load", function () {
  let Users = document.getElementById("Customers");

  fetch("http://localhost:5000/Users?Type=Customer")
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        console.error("Users not found in response data");
        return;
      }
      Users.innerText = data.length;
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
    });
});

window.addEventListener("load", function () {
  let Users = document.getElementById("Seller");

  fetch("http://localhost:5000/Users?Type=Seller")
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        console.error("Users not found in response data");
        return;
      }
      Users.innerText = data.length;
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
    });
});

// Loading Users
window.addEventListener("load", function () {
  let PageIndex = 0;
  let AllUsers;
  let RowsNum = this.document.getElementById("RowsNum");
  let EndIndex = 5;
  let RightBtn = this.document.getElementById("Right");
  let LeftBtn = this.document.getElementById("Left");
  fetch("http://localhost:5000/Users")
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        console.error("Users not found in response data");
        return;
      }
      AllUsers = data;
      RowsNum.innerText = `Number of Users ${AllUsers.length}`;
      LeftAndRightFunc(PageIndex);
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
    });

  let LeftAndRightFunc = function (PageIndex, Localdata = AllUsers) {
    TotalPagesNum = Math.ceil(Localdata.length / 5);
    let TempData = Localdata.slice(
      EndIndex + PageIndex * EndIndex - 5,
      EndIndex + PageIndex * EndIndex
    );
    const buttonsContainer = document.getElementById("Pages");
    buttonsContainer.innerHTML = ""; // Clear old buttons
    for (let i = 0; i < TotalPagesNum; i++) {
      const btn = document.createElement("button");
      btn.className = "page-btn";
      btn.textContent = i + 1;
      if (i === PageIndex) btn.classList.add("active");
      btn.addEventListener("click", function () {
        LeftAndRightFunc(i, Localdata); // Call the same function again with new PageIndex
      });
      buttonsContainer.appendChild(btn);
    }

    let tbody = document.querySelector(".users-table tbody");
    tbody.innerHTML = ""; // clear old rows

    for (let user of TempData) {
      let createdTr = document.createElement("tr");

      // Name (FullName)
      let nameTd = document.createElement("td");
      nameTd.className = "user-name";
      let nameSpan = document.createElement("span");
      nameSpan.innerText = user.FullName;
      nameTd.appendChild(nameSpan);
      createdTr.appendChild(nameTd);

      // Email
      let emailTd = document.createElement("td");
      emailTd.innerText = user.Email;
      createdTr.appendChild(emailTd);

      // Type
      let typeTd = document.createElement("td");
      typeTd.innerText = user.Type;
      createdTr.appendChild(typeTd);

      // Join Date (if not available, set it manually or leave empty)
      let dateTd = document.createElement("td");
      dateTd.innerText = user.JoinDate || "N/A"; // Replace "N/A" with actual value if available
      createdTr.appendChild(dateTd);

      // Actions (delete button)
      let actionsTd = document.createElement("td");
      actionsTd.className = "actions";
      let deleteBtn = document.createElement("button");
      deleteBtn.className = "action-btn delete-btn";
      deleteBtn.title = "Delete";

      let trashIcon = document.createElement("i");
      trashIcon.className = "fas fa-trash";

      deleteBtn.appendChild(trashIcon);
      actionsTd.appendChild(deleteBtn);
      createdTr.appendChild(actionsTd);

      tbody.appendChild(createdTr);

      trashIcon.addEventListener("click", function () {
        removeUser(user.id);
      });
    }
  };

  let SearchInput = document.getElementById("Search");
  SearchInput.addEventListener("keyup", function () {
    let keyword = SearchInput.value.toLowerCase();
    let FilteredUsers = AllUsers.filter((user) => {
      return Object.values(user).some((value) =>
        String(value).toLowerCase().includes(keyword)
      );
    });
    PageIndex = 0; // Reset to first page
    LeftAndRightFunc(PageIndex, FilteredUsers);
  });

  RightBtn.addEventListener("click", function () {
    if (PageIndex == TotalPagesNum - 1) {
      //Do Nothing;
    } else {
      PageIndex++;
      LeftAndRightFunc(PageIndex);
    }
  });

  LeftBtn.addEventListener("click", function () {
    if (PageIndex == 0) {
      //Do Nothing;
    } else {
      PageIndex--;
      LeftAndRightFunc(PageIndex);
    }
  });
});

function removeUser(id) {
  fetch(`http://localhost:5000/Users/${id}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Delete failed");
      // Reload products after delete
      window.location.reload();
    })
    .catch((err) => {
      console.error("Error deleting User:", err);
    });
}
