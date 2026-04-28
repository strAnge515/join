async function initHeader() {
  try {
    const isRoot = !window.location.pathname.includes("/pages/");
    const templatePath = isRoot ? "./pages/header.html" : "header.html";
    const response = await fetch(templatePath);

    if (!response.ok) return;

    let htmlText = await response.text();
    htmlText = adjustHeaderPaths(htmlText, isRoot);

    document.getElementById("header-container").innerHTML = htmlText;

    updateHeaderUI(getCurrentUser(), true);
    setupHeaderMenu();
  } catch (error) {
    console.error(error);
  }
}

function adjustHeaderPaths(htmlText, isRoot) {
  if (isRoot) {
    return htmlText.replace(/href="\.\/(?!assets)/g, 'href="./pages/');
  }

  let adjusted = htmlText.replace(/src="\.\/assets\//g, 'src="../assets/');
  return adjusted.replace(/href="\.\/assets\//g, 'href="../assets/');
}

function updateHeaderUI(user, isLoggedIn) {
  const headerRight = document.querySelector(".header-right");
  const accountCircle = document.getElementById("header-account-circle");

  if (!isLoggedIn && headerRight) {
    headerRight.style.display = "none";
    return;
  }

  if (accountCircle && user) {
    accountCircle.textContent = getInitials(user);
  }
}

function getInitials(user) {
  const firstName = String(user.firstName || "").trim();
  const lastName = String(user.lastName || "").trim();

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  if (firstName) {
    return firstName[0].toUpperCase();
  }

  return "?";
}

function setupHeaderMenu() {
  const accountCircle = document.getElementById("header-account-circle");
  const accountMenu = document.getElementById("header-account-menu");

  if (!accountCircle || !accountMenu) return;

  accountCircle.addEventListener("click", (event) => {
    event.stopPropagation();
    accountMenu.classList.toggle("account-menu--show");
  });

  document.addEventListener("click", (event) => {
    if (!accountMenu.contains(event.target)) {
      accountMenu.classList.remove("account-menu--show");
    }
  });
}

function getCurrentUser() {
  const savedUser = localStorage.getItem("currentUser");

  if (!savedUser) {
    return {
      firstName: "Guest",
      lastName: "",
    };
  }

  try {
    const user = JSON.parse(savedUser);

    if (user && user.firstName) {
      return {
        firstName: formatNamePart(user.firstName),
        lastName: formatNamePart(user.lastName || ""),
      };
    }
  } catch {
    return {
      firstName: formatNamePart(savedUser),
      lastName: "",
    };
  }

  return {
    firstName: "Guest",
    lastName: "",
  };
}

function formatNamePart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\w/, (firstLetter) => firstLetter.toUpperCase());
}

function logout() {
  localStorage.removeItem("currentUser");
}

initHeader();