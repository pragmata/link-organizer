let appData;

const container = document.getElementById("listsContainer");
const addNewURLBtn = document.getElementById("addNewURL");
const addUrlModal = document.getElementById("addUrlModal");
const manualListSelect = document.getElementById("manualListSelect");

/* ===========================
   INIT
=========================== */

loadData((data) => {
    appData = data;
    applyTheme();
    render();
    enableDragAndDrop(appData, saveData, render);
});

/* ===========================
   RENDER COMPLETO
=========================== */

function render() {

    container.innerHTML = "";

    appData.lists.forEach(list => {

        const listEl = document.createElement("div");
        listEl.className = "list";
        listEl.draggable = true;
        listEl.dataset.id = list.id;

        listEl.innerHTML = `
            <div  class="list-header" title="${list.description}">
                ${list.name} (${list.links.length})
					<div class="list-menu-wrapper">
						<img src="../assets/icons/list.svg" class="settings-btn">
						<div class="list-menu">
							<div class="edit-list">Edit</div>
							<div class="delete-list">Delete</div>
						</div>
					</div>
            </div>
            <div class="links"></div>
        `;

        const linksContainer = listEl.querySelector(".links");

        list.links.forEach(link => {

				const linkEl = document.createElement("div");
				linkEl.className = "link-item";
				linkEl.draggable = true;
				linkEl.dataset.id = link.id;

				/* 🔹 Guardamos datos en atributos para búsqueda */
				linkEl.dataset.title = link.title || "";
				linkEl.dataset.url = link.url || "";
				linkEl.dataset.comment = link.comment || "";

				linkEl.innerHTML = `
					<img src="${link.favicon || '../assets/default-favicon.png'}">
					<span  title="${link.comment}" class="link-title" >${link.title}</span>
						<div class="link-menu-wrapper" >
							<img src="../assets/icons/list.svg" class="settings-btn">
							<div class="link-menu">
							   <img src="../assets/icons/copy.svg" class="copy-link">
								<img src="../assets/icons/edit.svg" class="edit-link">
								<img src="../assets/icons/delete.svg" class="delete-link">
							</div>
						</div>
				`;

            // Abrir siempre en nueva pestaña
            linkEl.querySelector(".link-title").onclick = () => {
                chrome.tabs.create({ url: link.url });
            };

			const titleEl = linkEl.querySelector(".link-title");

			if (link.comment && link.comment.trim() !== "") {
				applyTooltipDelay(titleEl, link.comment);
			}

            // COPY
            linkEl.querySelector(".copy-link").onclick = () => {
                navigator.clipboard.writeText(link.url);
            };

            // EDIT LINK
			linkEl.querySelector(".edit-link").onclick = () => {
				openModal("Edit Link", `
					<input id="editTitle" value="${link.title}" placeholder="Enter link title">
					<input id="editUrl" value="${link.url}" placeholder="https://example.com">
					<textarea id="editComment" maxlength="1000" placeholder="Enter Description if you want">${link.comment || ""}</textarea>
				`, () => {

					const updatedLink = {
						title: document.getElementById("editTitle").value.trim(),
						url: document.getElementById("editUrl").value.trim(),
						comment: document.getElementById("editComment").value.trim()
					};

					if (!updatedLink.title) {
						alert("Please set a Title for the link");
						return false;
					}

					if (!updatedLink.url) {
						alert("Please set a URL for the link");
						return false;
					}

					if (!isValidUrl(updatedLink.url)) {
						alert("Please enter a valid URL (include https://)");
						return false;
					}

					// actualizar datos reales
					link.title = updatedLink.title;
					link.url = updatedLink.url;
					link.comment = updatedLink.comment;

					saveData(appData);
					render();

					return true;
				});
			};

            // DELETE LINK
            linkEl.querySelector(".delete-link").onclick = () => {
                list.links = list.links.filter(l => l.id !== link.id);
                saveData(appData);
                render();
            };

            linksContainer.appendChild(linkEl);
        });

        // EDIT LIST
        listEl.querySelector(".edit-list").onclick = () => {

            openModal("Edit List", `
                <input id="editListName" value="${list.name}">
                <textarea id="editListDesc">${list.description}</textarea>
            `, () => {
                list.name = document.getElementById("editListName").value;
                list.description = document.getElementById("editListDesc").value;
                saveData(appData);
                render();
				return true;
            });
        };

        // DELETE LIST
			listEl.querySelector(".delete-list").onclick = () => {
				openModal("Delete List", `
					Are you sure you want to delete this list?
				`, () => {

					appData.lists = appData.lists.filter(l => l.id !== list.id);

					if (appData.currentListId === list.id) {
						appData.currentListId = appData.lists.length
							? appData.lists[0].id
							: null;
					}

					saveData(appData);
					render();
					return true;
				});
			};



        container.appendChild(listEl);
    });

    saveData(appData);
	
	
// ==========================
// SETTINGS MENU CLICK SYSTEM
// ==========================

document.querySelectorAll(".settings-btn").forEach(btn => {

    btn.addEventListener("click", (e) => {
        e.stopPropagation();

        // cerrar otros abiertos
        document.querySelectorAll(".menu-open")
            .forEach(menu => menu.classList.remove("menu-open"));

        const wrapper = btn.closest(".list-menu-wrapper, .link-menu-wrapper");
        const menu = wrapper.querySelector(".list-menu, .link-menu");

        if (menu) {
            menu.classList.add("menu-open");
        }
    });

});

// cerrar al hacer click fuera
document.addEventListener("click", () => {
    document.querySelectorAll(".menu-open")
        .forEach(menu => menu.classList.remove("menu-open"));
});

	
}





/* ===========================
   ADD CURRENT (CON SELECTOR VISUAL)
=========================== */

document.getElementById("addCurrent").onclick = () => {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        const options = appData.lists.map(l =>
            `<option value="${l.id}">${l.name}</option>`
        ).join("");

        openModal("Choose List", `
            <select id="listSelect">${options}</select>
        `, () => {

            const listId = document.getElementById("listSelect").value;
            const list = appData.lists.find(l => l.id == listId);

            list.links.push({
                id: Date.now(),
                title: tab.title,
                url: tab.url,
                favicon: tab.favIconUrl,
                comment: ""
            });
			
        saveData(appData);
        render();
		 return true; //
        });
    });
};

/* ===========================
   CREATE LIST
=========================== */

document.getElementById("createList").onclick = () => {

    openModal("Create List", `
        <input id="newListName" placeholder="Name">
        <textarea id="newListDesc" placeholder="Description"></textarea>
    `, () => {

        const name = document.getElementById("newListName").value;
        const desc = document.getElementById("newListDesc").value;

        if (!name) return;

        appData.lists.push({
            id: Date.now(),
            name,
            description: desc,
            links: []
        });

        saveData(appData);
        render();
		 return true; 
    });
};

/* ===========================
   DELETE ALL LINKS
=========================== */

document.getElementById("deleteAll").onclick = () => {

    openModal("Delete All Links", `
        This will remove all links from all lists.
    `, () => {

        appData.lists.forEach(l => l.links = []);
        saveData(appData);
        render();
		return true; 
    });
};

/* ===========================
   SEARCH
=========================== */

document.getElementById("searchInput").oninput = (e) => {

    const term = e.target.value.toLowerCase().trim();

    document.querySelectorAll(".link-item").forEach(item => {

        const title = item.dataset.title.toLowerCase();
        const url = item.dataset.url.toLowerCase();
        const comment = item.dataset.comment.toLowerCase();

        const match =
            title.includes(term) ||
            url.includes(term) ||
            comment.includes(term);

        item.style.display = match ? "flex" : "none";
    });
};


/* ===========================
   THEME
=========================== */

function applyTheme() {
    document.body.classList.toggle("dark", appData.theme === "dark");
}

document.getElementById("themeToggle").onclick = () => {
    appData.theme = appData.theme === "dark" ? "light" : "dark";
    saveData(appData);
    applyTheme();
};

/* ===========================
   EXPORT / IMPORT
=========================== */

document.getElementById("exportBtn").onclick = () => {

    const blob = new Blob(
        [JSON.stringify(appData, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
        url: url,
        filename: "link-organizer-backup.json"
    });
};

document.getElementById("importBtn").onclick = () => {

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            appData = JSON.parse(reader.result);
            saveData(appData);
            render();
        };

        reader.readAsText(file);
    };

    input.click();
};

/* ===========================
   ADD URL MANUAL

=========================== */
document.getElementById("addNewURL").addEventListener("click", () => {

    loadData((data) => {

        const lists = appData.lists || [];

        if (!lists.length) {
            alert("You need to create a list first.");
            return;
        }

        const select = document.getElementById("manualListSelect");
        select.innerHTML = "";

        lists.forEach(list => {
            const option = document.createElement("option");
            option.value = list.id;
            option.textContent = list.name;
            select.appendChild(option);
        });

        document.getElementById("addUrlModal").classList.remove("hidden");
    });
});


document.getElementById("cancelManualUrl").addEventListener("click", () => {
    closeAddUrlModal();
});

function closeAddUrlModal() {
    document.getElementById("addUrlModal").classList.add("hidden");
    document.getElementById("manualTitle").value = "";
    document.getElementById("manualUrl").value = "";
    document.getElementById("manualDescription").value = "";
	//render();
}



document.getElementById("saveManualUrl").addEventListener("click", () => {

    const title = document.getElementById("manualTitle").value.trim();
    const url = document.getElementById("manualUrl").value.trim();
    const description = document.getElementById("manualDescription").value.trim();
    const selectedListId = document.getElementById("manualListSelect").value;

    if (!title || !url || !selectedListId) {
        alert("Please fill all required fields.");
        return;
    }

    if (!isValidUrl(url)) {
        alert("Please enter a valid URL (include https://)");
        return;
    }

    const list = appData.lists.find(l => l.id == selectedListId);

    if (!list) {
        alert("Selected list not found.");
        return;
    }

    const newLink = {
        id: Date.now(),
        title,
        url,
        favicon: `https://www.google.com/s2/favicons?sz=64&domain=${url}`,
        comment: description
    };

    list.links.push(newLink);

    saveData(appData);
    render();
    closeAddUrlModal();
});





function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}


