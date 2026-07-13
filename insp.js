async function checkLanguage() {
    let savedLanguage = await chrome.storage.local.get(['language']);
    const language = savedLanguage.language ? savedLanguage.language : navigator.language;
    document.getElementById("lang").value = language;
    changeLanguage(language)
}
async function changeLanguage(language) {
    await chrome.storage.local.set({language});
    
    for(let item in languages[language]) {
        document.getElementById(item).innerText = languages[language][item];
    }
    for(let item in languagesTitles[language]) {
        document.getElementById(item).title = languagesTitles[language][item];
    }
    for(let item in languagesElements[language]) {
        document.getElementById(item).innerHTML = languagesElements[language][item];
    }
    checkInspVisual();
}
async function checkInspVisual() {
    const result = await chrome.storage.local.get(["insp_visual_ligado"]);
    const langInput = document.getElementById("lang");
    const language = langInput.options[langInput.selectedIndex].value;

    if(result.insp_visual_ligado == true) {
        document.getElementById("insp_visual_ligado").checked = true;
        document.querySelector('#tooltip').innerHTML = languages[language].tooltip;
        document.querySelector('[for="insp_visual_ligado"]').innerHTML = languages[language].label_for_insp_visual_ligado;
    } else {
        document.getElementById("insp_visual_ligado").checked = false;
        document.querySelector('#tooltip').innerHTML = languagesExtra[language].tooltip;
        document.querySelector('[for="insp_visual_ligado"]').innerHTML = languagesExtra[language].desativado;
    }
}
async function checkLockOnOverlay() {
    const result = await chrome.storage.local.get(["insp_visual_bloquear_ao_sobrepor"]);
    if(result.insp_visual_bloquear_ao_sobrepor == true) {
        document.getElementById("insp_visual_bloquear_ao_sobrepor").checked = true;
    } else {
        document.getElementById("insp_visual_bloquear_ao_sobrepor").checked = false;
    }
}
async function checkHide() {
    const result = await chrome.storage.local.get(["insp_visual_ocultar"]);
    if(result.insp_visual_ocultar == true) {
        document.getElementById("insp_visual_ocultar").checked = true;
    } else {
        document.getElementById("insp_visual_ocultar").checked = false;
    }
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
    if(result.insp_visual_leitor_de_tela == true) {
        document.getElementById("insp_visual_leitor_de_tela").checked = true;
        document.getElementById("vozes").parentElement.classList.remove("d-none");
    } else {
        document.getElementById("insp_visual_leitor_de_tela").checked = false;
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
        document.querySelector('#tooltip').innerHTML = "Ative o Inpetor Visual para inspecionar elementos.";
        document.querySelector('[for="insp_visual_ligado"]').innerHTML = "Desativado";
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
        document.querySelector('#tooltip').innerHTML = "Copie um elemento pelo menu de contexto Inpetor Visual.";
        document.querySelector('[for="insp_visual_ligado"]').innerHTML = "Ativado";
    }
}
async function speakerChangeState() {
    const result = await chrome.storage.local.get(["insp_visual_leitor_de_tela"]);
    if(result.insp_visual_leitor_de_tela == true) {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        await chrome.storage.local.set({insp_visual_leitor_de_tela: false});
        document.getElementById("vozes").parentElement.classList.add("d-none");
    } else {
        await chrome.storage.local.set({insp_visual_leitor_de_tela: true});
        document.getElementById("vozes").parentElement.classList.remove("d-none");
    }
}

async function changeLockOnOverlay() {
    const result = await chrome.storage.local.get(["insp_visual_bloquear_ao_sobrepor"]);
    if(result.insp_visual_bloquear_ao_sobrepor == true) {
        await chrome.storage.local.set({insp_visual_bloquear_ao_sobrepor: false});
    } else {
        await chrome.storage.local.set({insp_visual_bloquear_ao_sobrepor: true});
    }
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
    checkLanguage();
    checkInspVisual();
    checkLockOnOverlay();
    checkSpeaker();
    checkHide();
    langInput.onchange = (event) => changeLanguage(langInput.options[langInput.selectedIndex].value);
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