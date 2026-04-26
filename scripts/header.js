let testUser = {
    name: "Anton Mayer"
};

async function initHeader() {
    try {
        const isRoot = !window.location.pathname.includes('/pages/');
        const templatePath = isRoot ? './pages/header.html' : 'header.html';
        const response = await fetch(templatePath);

        if (response.ok) {
            let htmlText = await response.text();
            htmlText = adjustHeaderPaths(htmlText, isRoot);
            document.getElementById('header-container').innerHTML = htmlText;

            updateHeaderUI(getCurrentUser(), true);
            setupHeaderMenu();
        }
    } catch (error) {
        console.error(error);
    }
}

function adjustHeaderPaths(htmlText, isRoot) {
    if (isRoot) {
        return htmlText.replace(/href="\.\/(?!assets)/g, 'href="./pages/');
    } else {
        let adjusted = htmlText.replace(/src="\.\/assets\//g, 'src="../assets/');
        return adjusted.replace(/href="\.\/assets\//g, 'href="../assets/');
    }
}

function updateHeaderUI(user, isLoggedIn) {
    const headerRight = document.querySelector('.header-right');
    const accountCircle = document.getElementById('header-account-circle');

    if (!isLoggedIn && headerRight) {
        headerRight.style.display = 'none';
        return;
    }
    if (accountCircle && user && user.name) {
        accountCircle.innerText = getInitials(user.name);
    }
}


function getInitials(name) {
    const cleanedName = String(name || "").trim();

    if (!cleanedName) return "?";

    const words = cleanedName.split(" ").filter(Boolean);

    if (words.length >= 2) {
        return words
            .map(word => word[0])
            .join("")
            .toUpperCase();
    }

    const camelCaseParts = cleanedName.match(/[A-ZÄÖÜ][a-zäöüß]*/g);

    if (camelCaseParts && camelCaseParts.length >= 2) {
        return camelCaseParts
            .map(part => part[0])
            .join("")
            .toUpperCase();
    }

    return cleanedName[0].toUpperCase();
}


function setupHeaderMenu() {
    const accountCircle = document.getElementById('header-account-circle');
    const accountMenu = document.getElementById('header-account-menu');

    if (accountCircle && accountMenu) {
        accountCircle.addEventListener('click', () => {
            accountMenu.classList.toggle('account-menu--show');
        });
        document.addEventListener('click', (event) => {
            if (!accountCircle.contains(event.target)) {
                accountMenu.classList.remove('account-menu--show');
            }
        });
    }
}

function logout() {
    localStorage.removeItem("currentUser");
}

document.addEventListener("DOMContentLoaded", () => {
    initHeaderAvatar();
});

function getCurrentUser() {
  const userName = localStorage.getItem("currentUser") || "Gast";
  return { name: formatUserName(userName) };
}

function formatUserName(name) {
  if (!name) return "";

  let cleanName = name.includes("@") ? name.split("@")[0] : name;

  if (cleanName.toLowerCase() === "volskijuri") {
    return "Volski Juri";
  }

  let formatted = cleanName.replace(/([a-z])([A-Z])/g, "$1 $2");

  formatted = formatted
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return formatted;
}

initHeader();