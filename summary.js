
const dateElement = document.getElementById("current-date");
const today = new Date();
const options = {
    year: "numeric",
    month: "long",
    day: "numeric"
};
const formattedDate = today.toLocaleDateString("en-US", options);
dateElement.textContent = formattedDate;
