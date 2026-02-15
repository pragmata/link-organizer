const STORAGE_KEY = "linkOrganizerData";

function loadData(callback) {
    chrome.storage.sync.get(STORAGE_KEY, (res) => {
        if (res[STORAGE_KEY]) {
            callback(res[STORAGE_KEY]);
        } else {
            callback({
                theme: "light",
                lists: [
                    { id: Date.now(), name: "General", description: "", links: [] }
                ]
            });
        }
    });
}


function saveData(data) {
    chrome.storage.sync.set({ [STORAGE_KEY]: data });
}

