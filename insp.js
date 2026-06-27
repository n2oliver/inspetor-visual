async function checkInspVisual() {
    const result = await chrome.storage.local.get(["insp_visual_ligado"]);
    if(result.insp_visual_ligado == true) {
        document.getElementById("insp_visual_ligado").checked = true;
        document.querySelector('#tooltip').innerHTML = "Copie um elemento pelo menu de contexto Inpetor Visual.";
        document.querySelector('[for="insp_visual_ligado"]').innerHTML = "&nbsp;Ativado";
    } else {
        document.getElementById("insp_visual_ligado").checked = false;
        document.querySelector('#tooltip').innerHTML = "Ative o Inpetor Visual para inspecionar elementos.";
        document.querySelector('[for="insp_visual_ligado"]').innerHTML = "&nbsp;Desativado";
    }
}

async function changeState() {
    const result = await chrome.storage.local.get(["insp_visual_ligado"]);
    if(result.insp_visual_ligado == true) {
        await chrome.storage.local.set({insp_visual_ligado: false});
        chrome.contextMenus.remove("copiarElemento");
        chrome.contextMenus.remove("copiarHTML");
        chrome.contextMenus.remove("copiarCSS");
        document.querySelector('#tooltip').innerHTML = "Ative o Inpetor Visual para inspecionar elementos.";
        document.querySelector('[for="insp_visual_ligado"]').innerHTML = "&nbsp;Desativado";
    } else {
        await chrome.storage.local.set({insp_visual_ligado: true});

        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                id: "copiarElemento",
                title: "Copiar HTML + CSS",
                contexts: ["all"]
            });
            chrome.contextMenus.create({
                id: "copiarHTML",
                title: "Copiar HTML",
                contexts: ["all"]
            });
            chrome.contextMenus.create({
                id: "copiarCSS",
                title: "Copiar CSS",
                contexts: ["all"]
            });
        });
        document.querySelector('#tooltip').innerHTML = "Copie um elemento pelo menu de contexto Inpetor Visual.";
        document.querySelector('[for="insp_visual_ligado"]').innerHTML = "&nbsp;Ativado";
    }
}
window.onload = () => {
    checkInspVisual();
    document.getElementById("insp_visual_ligado").onclick= changeState
}