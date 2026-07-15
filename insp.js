async function changeLanguage() {
    document.getElementById("tooltip").textContent = chrome.i18n.getMessage("tooltip");
    document.querySelector('[for="insp_visual_ligado"]').textContent = chrome.i18n.getMessage("labelForInspVisualLigado");
    document.querySelector('[for="insp_visual_bloquear_ao_sobrepor"]').textContent = chrome.i18n.getMessage("labelForInspVisualBloquearAoSobrepor");
    document.querySelector('[for="insp_visual_leitor_de_tela"]').textContent = chrome.i18n.getMessage("labelForInspVisualLeitorDeTela");
    document.querySelector('[for="insp_visual_ocultar"]').textContent = chrome.i18n.getMessage("labelForInspVisualOcultar");
    document.getElementById("btn-info").title = chrome.i18n.getMessage("btnInfo");
    document.getElementById("info").innerHTML = chrome.i18n.getMessage("info");
    checkInspVisual();
}
async function checkInspVisual() {
    const result = await chrome.storage.local.get(["insp_visual_ligado"]);
    document.getElementById("insp_visual_ligado").checked = result.insp_visual_ligado === true;

    if(result.insp_visual_ligado == true) {
        document.querySelector('#tooltip').innerHTML = chrome.i18n.getMessage("tooltip");
        document.querySelector('[for="insp_visual_ligado"]').innerHTML = chrome.i18n.getMessage("labelForInspVisualLigado");
    } else {
        document.querySelector('#tooltip').innerHTML = chrome.i18n.getMessage("labelForInspVisualLigado");
        document.querySelector('[for="insp_visual_ligado"]').innerHTML = chrome.i18n.getMessage("labelForInspVisualDesligado");
    }
}
async function checkLockOnOverlay() {
    const result = await chrome.storage.local.get(["insp_visual_bloquear_ao_sobrepor"]);
    document.getElementById("insp_visual_bloquear_ao_sobrepor").checked = result.insp_visual_bloquear_ao_sobrepor === true;
}

async function checkHide() {
    const result = await chrome.storage.local.get(["insp_visual_ocultar"]);
    document.getElementById("insp_visual_ocultar").checked = result.insp_visual_ocultar === true;
}
async function checkSpeaker() {
    const result = await chrome.storage.local.get(["insp_visual_leitor_de_tela"]);
    const vozResult = await chrome.storage.local.get(["voz"]);
    const selectVozes = document.getElementById("vozes");
    if('speechSynthesis' in window) {
        window.speechSynthesis.addEventListener("voiceschanged", () => {
            const vozes = speechSynthesis.getVoices();
            for(let i in vozes) {
                const option = document.createElement('option');
                option.innerText = vozes[i].name;
                option.value = i;
                if(vozResult.voz == i) {
                    option.selected = true;
                }
                selectVozes.appendChild(option);
            }
            selectVozes.onchange = async () => {
                await chrome.storage.local.set({voz: selectVozes.selectedIndex });
            }
        });
    }
    document.getElementById("insp_visual_leitor_de_tela").checked = result.insp_visual_leitor_de_tela === true;
    if(result.insp_visual_leitor_de_tela == true) {
        document.getElementById("vozes").parentElement.classList.remove("d-none");
    } else {
        document.getElementById("vozes").parentElement.classList.add("d-none");
    }
}
async function changeState() {
    const result = await chrome.storage.local.get(["insp_visual_ligado"]);
    if(result.insp_visual_ligado == true) {
        await chrome.storage.local.set({insp_visual_ligado: false});
        chrome.contextMenus.remove("copiarTexto");
        chrome.contextMenus.remove("copiarElemento");
        chrome.contextMenus.remove("copiarHTML");
        chrome.contextMenus.remove("copiarCSS");
        document.querySelector('#tooltip').innerHTML = chrome.i18n.getMessage("tooltipForInspVisualDesligado");
        document.querySelector('[for="insp_visual_ligado"]').innerHTML = chrome.i18n.getMessage("labelForInspVisualDesligado");
    } else {
        await chrome.storage.local.set({insp_visual_ligado: true});

        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                id: "copiarTexto",
                title: "Copiar texto",
                contexts: ["page"]
            });
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
        document.querySelector('#tooltip').innerHTML = chrome.i18n.getMessage("tooltip");
        document.querySelector('[for="insp_visual_ligado"]').innerHTML = chrome.i18n.getMessage("labelForInspVisualLigado");
    }
}
async function speakerChangeState() {
    const result = await chrome.storage.local.get(["insp_visual_leitor_de_tela"]);
    await chrome.storage.local.set({insp_visual_leitor_de_tela: !result.insp_visual_leitor_de_tela});
    if(result.insp_visual_leitor_de_tela == true) {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        document.getElementById("vozes").parentElement.classList.add("d-none");
    } else {
        document.getElementById("vozes").parentElement.classList.remove("d-none");
    }
}

async function changeLockOnOverlay() {
    const result = await chrome.storage.local.get(["insp_visual_bloquear_ao_sobrepor"]);
    await chrome.storage.local.set({insp_visual_bloquear_ao_sobrepor: !result.insp_visual_bloquear_ao_sobrepor});
}

async function changeHideState(event) {
    const result = await chrome.storage.local.get(["insp_visual_ocultar"]);
    if(result.insp_visual_ocultar == true) {
        await chrome.storage.local.set({insp_visual_ocultar: false});
        await chrome.storage.local.set({inspetor_visual_bloqueado: false});
        
        chrome.runtime.sendMessage({
            action: "desbloquear",
            dados: {targetElementId: event.target.id}
        }, (resposta) => {
        });
    } else {
        await chrome.storage.local.set({insp_visual_ocultar: true});
    }
}

window.onload = () => {
    const langInput = document.getElementById("lang");
    changeLanguage();
    checkInspVisual();
    checkLockOnOverlay();
    checkSpeaker();
    checkHide();
    document.getElementById("insp_visual_ligado").onclick= changeState;
    document.getElementById("insp_visual_leitor_de_tela").onclick= speakerChangeState;
    document.getElementById("insp_visual_bloquear_ao_sobrepor").onclick= changeLockOnOverlay;
    document.getElementById("insp_visual_ocultar").onclick= changeHideState;
    document.getElementById("btn-info").addEventListener("click", () => {
        const info = document.getElementById("info");
        if(info.style.display == 'none') {
            info.style.display = 'block';
        } else {
            info.style.display = 'none';
        }
    });
    document.getElementById("n2oliver-link").addEventListener("click", () => window.open('https://n2oliver.com'));
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    sendResponse({ status: "success" });
    if (request.action === "ocultar") {
        document.getElementById("insp_visual_ocultar").checked = true;
        await chrome.storage.local.set({insp_visual_ocultar: true});
    }
});