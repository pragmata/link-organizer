/* ==========================================
   DRAG & DROP REAL (LISTAS Y LINKS)
========================================== */

function enableDragAndDrop(data, saveCallback, renderCallback) {

    let draggedItem = null;
    let draggedType = null; // "list" o "link"

    document.addEventListener("dragstart", (e) => {
        const listEl = e.target.closest(".list");
        const linkEl = e.target.closest(".link-item");

        if (listEl) {
            draggedItem = listEl.dataset.id;
            draggedType = "list";
        }

        if (linkEl) {
            draggedItem = linkEl.dataset.id;
            draggedType = "link";
        }
    });

    document.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    document.addEventListener("drop", (e) => {
        e.preventDefault();

        if (draggedType === "list") {
            const target = e.target.closest(".list");
            if (!target) return;

            const fromIndex = data.lists.findIndex(l => l.id == draggedItem);
            const toIndex = data.lists.findIndex(l => l.id == target.dataset.id);

            if (fromIndex === -1 || toIndex === -1) return;

            const [moved] = data.lists.splice(fromIndex, 1);
            data.lists.splice(toIndex, 0, moved);
        }

        if (draggedType === "link") {
            const targetLink = e.target.closest(".link-item");
            const targetList = e.target.closest(".list");

            if (!targetList) return;

            let fromList, linkObj;

            data.lists.forEach(list => {
                const index = list.links.findIndex(l => l.id == draggedItem);
                if (index !== -1) {
                    fromList = list;
                    linkObj = list.links.splice(index, 1)[0];
                }
            });

            if (!linkObj) return;

            const toList = data.lists.find(l => l.id == targetList.dataset.id);

            if (targetLink) {
                const toIndex = toList.links.findIndex(l => l.id == targetLink.dataset.id);
                toList.links.splice(toIndex, 0, linkObj);
            } else {
                toList.links.push(linkObj);
            }
        }

        saveCallback(data);
        renderCallback();
    });
}
