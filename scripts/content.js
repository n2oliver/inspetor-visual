import { extractText, getDocumentProxy } from "unpdf";
import { buildPopUp, getCssStyles, bloquear, contextoValido, eventos, desbloquear } from "./popup.js";
import { speak, cancelSpeak } from "./speaker.js";
let copyBuffer = {};
let visitedElements = [];
const timeoutValue = 300;
const ehPDF = window.location.href.substring(window.location.href.length-4) == '.pdf';
let timeout = setTimeout(()=>{},timeoutValue);

const popupId = 'inspetor-visual-popup';

()=>(async ()=>{
    if(!chrome.storage) {
        return;
    }
    await chrome.storage.local.set({'inspetor_visual_bloqueado': false});
    localStorage.setItem('inspetor_visual_bloqueado', false);
})();


window.oncontextmenu = async (event) => {
    if(!chrome.storage) {
        return;
    } 
    const result = await chrome.storage.local.get(["insp_visual_ligado"]);
    if (result.insp_visual_ligado == true) {
        try {
            copyBuffer = event.target.cloneNode(true);
            let i = 0;
            while (document.querySelector("#inspetor-visual-copiado-" + i)) {
                i++;
            }
            copyBuffer.id = "inspetor-visual-copiado-" + i
        } catch (e) {
            console.error(e);
        }

        window.onmousemove = mousemove;
    } else if(!ehPDF) {
        desativar();
    }
}
document.body.addEventListener('click', ()=>{
    const popup = document.getElementById("inspetor-visual-popup");

    if(popup && !event.target.closest('#'+popupId) && popup.style.position != 'sticky' && !ehPDF) {
        desbloquear({timeout});
    }
});
window.addEventListener('load', async () => {
    if(!chrome.storage || ehPDF) {
        return;
    }
    
    window.focus();
    window.addEventListener("keydown", (event) => eventos(event, timeout, popupId));

    document.body.onmouseenter = async (event) => {
        if(!chrome.storage || !contextoValido()) {
            return;
        }
        const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
        const bloqueado = (document.getElementById(popupId) && localStorage.getItem('inspetor_visual_bloqueado') == 'true') || bloqueioResult.inspetor_visual_bloqueado;
        if(bloqueado) {
            return;
        }
        const result = await chrome.storage.local.get(["insp_visual_ligado"]);
        if (result.insp_visual_ligado == false && !ehPDF) {
            desativar();
        } else if(!ehPDF) {
            window.onmousemove = mousemove;
        }
    }
});

window.onmousemove = mousemove;
async function mousemove(event) {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
        
        try {
            if(!chrome.storage) {
                return;
            }
            const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
            const ocultarResult = await chrome.storage.local.get(['insp_visual_ocultar']);
            const bloqueado = (document.getElementById(popupId) && localStorage.getItem('inspetor_visual_bloqueado') == 'true') || bloqueioResult.inspetor_visual_bloqueado;
            if(ocultarResult.insp_visual_ocultar) {
                const popup = document.getElementById(popupId);
                if(popup) {
                    limpar();
                }
            }

            if(ehPDF) {
                desbloquear({timeout});
                desativar();
                return;
            }
            
            if(bloqueado) {
                return;
            }
            const result = await chrome.storage.local.get(["insp_visual_ligado"]);
            if (chrome.storage && chrome.storage.local && !!chrome?.runtime?.id && 
                result.insp_visual_ligado == true) {

                buildPopUp(event, popupId, copyBuffer, visitedElements, bloqueado, timeoutValue, timeout);
            } else {
                desativar();
            }
        } catch (e) {
            console.log(e);
        }
    }, timeoutValue);
}
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    sendResponse({ status: "success" });
    if (request.action === "copiarTexto") {
        copyBuffer.style.border = "";
        const result = await chrome.storage.local.get(["inner_text_copy"])
        let textoParaCopiar = result.inner_text_copy;

        if (textoParaCopiar) {
            navigator.clipboard.writeText(textoParaCopiar).then(() => {
                console.log("Texto copiado com sucesso!");
            }).catch(err => {
                console.error("Erro ao copiar: ", err);
            });
        }
    }
    if (request.action === "copiarElemento") {
        copyBuffer.style.border = "";

        let textoParaCopiar = copyBuffer.outerHTML + "<style>#" + copyBuffer.id + " {" + getCssStyles(copyBuffer) + "}\n\n";

        i = 0
        for (const element of copyBuffer.children) {
            textoParaCopiar += "#" + copyBuffer.id + "-filho-" + i + "\n{" + getCssStyles(element) + "}\n\n";
        }
        textoParaCopiar += "</style>";

        if (textoParaCopiar) {
            navigator.clipboard.writeText(textoParaCopiar).then(() => {
                console.log("Elemento copiado com sucesso!");
            }).catch(err => {
                console.error("Erro ao copiar: ", err);
            });
        }
    }
    if (request.action === "copiarHTML") {
        copyBuffer.style.border = "";

        let textoParaCopiar = copyBuffer.outerHTML;
        if (textoParaCopiar) {
            navigator.clipboard.writeText(textoParaCopiar).then(() => {
                console.log("Elemento copiado com sucesso!");
            }).catch(err => {
                console.error("Erro ao copiar: ", err);
            });
        }
    }
    if (request.action === "copiarCSS") {
        let textoParaCopiar = "#inspetor-visual-copiado {" + getCssStyles(copyBuffer) + "}\n\n";
        let i = 0
        for (const element of copyBuffer.children) {
            textoParaCopiar += "#inspetor-visual-filho-copiado-" + i + "\n{" + getCssStyles(element) + "}\n\n";
        }

        if (textoParaCopiar) {
            navigator.clipboard.writeText(textoParaCopiar).then(() => {
                console.log("Estilo copiado com sucesso!");
            }).catch(err => {
                console.error("Erro ao copiar: ", err);
            });
        }
    }
    if (request.action === "desbloquear") {
        desbloquear({timeout});
    }

    return true;
});
function desativar() {
    limpar();
    window.mousemove = null;
}
function limpar() {
    visitedElements.forEach((elem) => {
        elem.onmouseover = null;
        elem.onmouseout = null;
    });
    visitedElements = [];
    const popup = document.getElementById('inspetor-visual-popup');
    if (popup) popup.remove();
}
document.addEventListener('mouseleave', async () => {
    try {
        if(!chrome.storage || !contextoValido()) {
            return;
        }
        const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
        const bloqueado = (document.getElementById(popupId) && localStorage.getItem('inspetor_visual_bloqueado') == 'true') || bloqueioResult.inspetor_visual_bloqueado;
        if(!bloqueado && !ehPDF)
            cancelSpeak();
    } catch (e) {
        console.error(e);
    }
});