/* ==========================================
   MODAL PROFESIONAL REUTILIZABLE
========================================== */

function openModal(title, contentHTML, onConfirm) {

    const overlay = document.getElementById("modalOverlay");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
    const confirmBtn = document.getElementById("modalConfirm");
    const cancelBtn = document.getElementById("modalCancel");

    modalTitle.innerText = title;
    modalContent.innerHTML = contentHTML;
	
	 overlay.classList.remove("hidden");

    confirmBtn.onclick = () => {
			 const shouldClose = onConfirm(); // esperar respuesta

			if (shouldClose) {
				overlay.classList.add("hidden");
			}
    };

    cancelBtn.onclick = () => {
        overlay.classList.add("hidden");
    };
}

/* ==========================================
   TOOLTIP DELAY 2 SEGUNDOS
========================================== */

function applyTooltipDelay(element, text) {
    let timer;
    element.addEventListener("mouseenter", () => {
        timer = setTimeout(() => {
            element.title = text;
        }, 500);
    });
    element.addEventListener("mouseleave", () => {
        clearTimeout(timer);
    });
}
