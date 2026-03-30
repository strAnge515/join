

const BASE_URL = "https://join-949a8-default-rtdb.europe-west1.firebasedatabase.app/"

function onloadFunc() {
    console.log("test");
    loadData();
   
}

async function loadData(path = "") {
    let data = await fetch(BASE_URL + path + ".json")
    let response = await data.json();
    console.log(response);

}

async function postData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return responseToJson = await response.json();
}

let task = {
    title: "Kanbanboard erstellen",
    description: "baue ein Kanbanboard mit drag and drop system",
    category: "to do",
    assignet_to: ["Max", "Steffi", "Denny"],
    date: "date",
    prio: "urgend",
    subtask: [{ title: "drag and drop einbauen", state: "false" },
    { titel: "Bispiel 2", state: "false" },
    { titel: "Beispiel 3", state: "false" }
    ]
}