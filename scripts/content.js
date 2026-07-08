console.log("Content script carregado!");
let copyBuffer = {};
let visitedElements = [];
const timeoutValue = 300;
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
            console.log(e);
        }

        window.onmousemove = mousemove;
    } else {
        desativar();
    }
}
document.body.addEventListener('click', ()=>{
    const popup = document.getElementById("inspetor-visual-popup");

    if(popup && !event.target.closest('#'+popupId) && popup.style.position != 'sticky') {
        desbloquear();
    }
});
document.addEventListener('DOMContentLoaded', async () => {
    if(!chrome.storage) {
        return;
    }
    const bloqueado = document.getElementById(popupId) && localStorage.getItem('inspetor_visual_bloqueado') == 'true';
    if(bloqueado) {
        chrome.storage.local.set({'inspetor_visual_bloqueado': false});
        localStorage.setItem('inspetor_visual_bloqueado', false);
    }
    document.body.onmouseenter = async (event) => {
        if(!chrome.storage) {
            return;
        }
        const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
        const bloqueado = (document.getElementById(popupId) && localStorage.getItem('inspetor_visual_bloqueado') == 'true') || bloqueioResult.inspetor_visual_bloqueado;
        if(bloqueado) {
            return;
        }
        const result = await chrome.storage.local.get(["insp_visual_ligado"]);
        if (result.insp_visual_ligado == false) {
            desativar();
        } else {
            window.onmousemove = mousemove;
        }
    }
});

window.onmousemove = mousemove;
async function mousemove(event) {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
        
        if(!chrome.storage) {
            return;
        }
        const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
        const bloqueado = (document.getElementById(popupId) && localStorage.getItem('inspetor_visual_bloqueado') == 'true') || bloqueioResult.inspetor_visual_bloqueado;
        if(bloqueado) {
            return;
        }
        const result = await chrome.storage.local.get(["insp_visual_ligado"]);
        const speakerResult = await chrome.storage.local.get(["insp_visual_leitor_de_tela"]);
        if (chrome.storage && chrome.storage.local && !!chrome?.runtime?.id && 
            result.insp_visual_ligado == true) {

            let oldPopup = document.getElementById('inspetor-visual-popup');
            let innerHTML = '';
            const popup = document.createElement('div');

            popup.id = popupId;
            const styles = {
                width: 'fit-content',
                height: 'fit-content',
                backgroundColor: 'rgba(191, 249, 255, .93)',
                border: 'solid 1px rgb(14, 8, 95)',
                position: 'fixed',
                top: (event.pageY + 14) + 'px',
                left: (event.pageX + 14) + 'px',
                zIndex: 99999999,
                minWidth: '100px',
                padding: '14px',
                color: 'rgb(14, 8, 95)',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
            }

            try {
                const element = event.target;
                if (element != null) {
                    const estilos = getComputedStyle(element);
                    const dimensoes = element.getBoundingClientRect();
                    if (element.innerText) {
                        await chrome.storage.local.set({ inner_text_copy: element.innerText });
                        if (speakerResult.insp_visual_leitor_de_tela == true) {
                            speak(element.innerText);
                        }
                        innerHTML += '<strong>' + element.innerText.split(' ')[0] +
                            (element.innerText.split(' ')[1] ? ' ' + element.innerText.split(' ')[1] : '') +
                            (element.innerText.split(' ')[2] ? ' ' + element.innerText.split(' ')[2] : '') + '</strong>';
                    }
                    innerHTML += '<div style="display: flex; white-space: nowrap; justify-content: space-between"><strong>ID:</strong> <pre style="background-color: lightgrey;width: fit-content; padding-left: .25rem !important; padding-right: .25rem !important; text-color: black; border-radius: 5px; margin: 0; border: solid 1px gray; padding: 0;">' + ((element.id || estilos.id ? '#' + 
                        (element.id || estilos.id) : '(vazio)')) + '</pre></div>';
                        
                    innerHTML += '<div style="display: flex; white-space: nowrap; justify-content: space-between"><strong>Tagname:</strong> <pre style="background-color: lightgrey;width: fit-content; padding-left: .25rem !important; padding-right: .25rem !important; text-color: black; border-radius: 5px; margin: 0; border: solid 1px gray; padding: 0;">' + element.localName + '</pre></div>';
                    
                    if((!(element.id || estilos.id) && element.className || estilos.className)) {
                        if(element.classList.length) {
                            const className = Object.assign([], element.classList).map((v) => '.' + v).join(' ');
                            innerHTML += '<div style="display: flex; white-space: nowrap; justify-content: space-between"><strong>Classname:</strong> <pre style="background-color: lightgrey;width: fit-content; padding-left: .25rem !important; padding-right: .25rem !important; text-color: black; border-radius: 5px; margin: 0; border: solid 1px gray; padding: 0;">' + className + '</pre></div>';
                        }
                    }
                    

                    const width = (Math.abs(parseFloat(element.style.width || estilos.width).toFixed(2)));
                    const height = (Math.abs(parseFloat(element.style.height || estilos.height).toFixed(2)));
                    innerHTML += '<div style="display: flex; white-space: nowrap; justify-content: space-between"><strong>Width:</strong> <pre style="background-color: lightgrey;width: fit-content; padding-left: .25rem !important; padding-right: .25rem !important; text-color: black; border-radius: 5px; margin: 0; border: solid 1px gray; padding: 0;">' + (!isNaN(width) ? width + 'px' : 'não declarado') + '</pre></div>';
                    innerHTML += '<div style="display: flex; white-space: nowrap; justify-content: space-between"><strong>Height:</strong> <pre style="background-color: lightgrey;width: fit-content; padding-left: .25rem !important; padding-right: .25rem !important; text-color: black; border-radius: 5px; margin: 0; border: solid 1px gray; padding: 0;">' + (!isNaN(height) ? height + 'px' : 'não declarado') + '</pre></div>';
                    innerHTML += '<div style="display: flex; white-space: nowrap; justify-content: space-between"><strong>Dimensões:</strong> <pre style="background-color: lightgrey;width: fit-content; padding-left: .25rem !important; padding-right: .25rem !important; text-color: black; border-radius: 5px; margin: 0; border: solid 1px gray; padding: 0;">' + Math.abs(parseFloat(dimensoes.width).toFixed(2)) + 'px x ' + Math.abs(parseFloat(dimensoes.height).toFixed(2)) + 'px</pre></div>';
                    if ((element.style.backgroundColor || estilos.backgroundColor)) {
                        const bgColor = rgbaToHex(element.style.backgroundColor || estilos.backgroundColor);
                        innerHTML += 
                            `<div style="display: flex; white-space: nowrap; justify-content: space-between">
                                <strong>Background-color:</strong> <pre style="background-color: lightgrey;width: fit-content; padding-left: .25rem !important; padding-right: .25rem !important; text-color: black; border-radius: 5px; margin: 0; border: solid 1px gray; padding: 0; display: flex">
                                <div style="
                                    display: inline-block;
                                    border: 2px solid white;
                                    height: 12px;
                                    width: 12px;
                                    background-color: ${bgColor}"></div> ${bgColor}</pre>
                                </div>`;
                    }
                    if ((element.style.color || estilos.color)) {
                        const color = rgbaToHex(element.style.color || estilos.color);
                        innerHTML += 
                            `<div style="display: flex; white-space: nowrap; justify-content: space-between">
                                <strong>Color:</strong> <pre style="background-color: lightgrey;width: fit-content; padding-left: .25rem !important; padding-right: .25rem !important; text-color: black; border-radius: 5px; margin: 0; border: solid 1px gray; padding: 0; display: flex;">
                                <div style="
                                    display: inline-block;
                                    border: 2px solid white;
                                    height: 12px;
                                    width: 12px;
                                    background-color: ${color}"></div> ${color}</pre>
                                </div>`;
                    }
                    innerHTML += '</div>';
                    popup.innerHTML = innerHTML;

                    if (!visitedElements.includes(element)) {
                        visitedElements.push(element);
                    }

                    if (result.insp_visual_ligado == true) {
                        element.onmouseover = (event) => {
                            if(bloqueado) {
                                return;
                            }
                            element.style.border = "2px dashed blue";
                            if (element.parent) {
                                if (!visitedElements.includes(element.parent)) {
                                    visitedElements.push(element.parent);
                                }

                                const parentElement = element.parent;
                                parentElement.onmouseover = (parentEvent) => {
                                    if(bloqueado) {
                                        return;
                                    }
                                    parentElement.style.border = "12px dashed blue";
                                }
                                parentElement.onmouseout = (parentEvent) => {
                                    if(bloqueado) {
                                        return;
                                    }
                                    parentElement.style.border = "";
                                }
                            }
                        }
                        element.onmouseout = (event) => {
                            if(bloqueado) {
                                return;
                            }
                            element.style.border = "";
                        }
                    } else {
                        if(bloqueado) {
                            return;
                        }
                        element.style.border = "";

                        if (element.parent) {
                            parentElement.style.border = "";
                        }
                        desativar();
                    }
                }
                if(bloqueado) {
                    return;
                }
                if (oldPopup) {
                    oldPopup.remove();
                    delete oldPopup;
                }
                if (result.insp_visual_ligado == true && window.location.href.substring(window.location.href.length-4) != '.pdf') {
                    let popupInDocument = document.getElementById(popupId);
                    if (!popupInDocument) {
                        document.body.appendChild(popup);
                        popupInDocument = document.getElementById(popup.id);
                    }
                    
                    Object.assign(popupInDocument.style, styles);
                    innerHTML += '<div tabindex="0" id="insp_visual_bloqueador" class="text-center"><a id="inspetor_visual_popup_click" class="text-decoration-none" href="#" style="color: orange !important"><strong>(B) Bloquear<span id="insp_visual_bloquear" style="' + (!bloqueado ? 'display: none' : '') + '"> (bloqueado)</span></strong></a></div>'
                    popupInDocument.innerHTML = innerHTML;
                    popupInDocument.querySelector("#inspetor_visual_popup_click").addEventListener("click", ()=>{
                        event.preventDefault();
                        popupClick();
                    });
                    popupInDocument.addEventListener("mouseenter", ()=>{
                        event.preventDefault();
                        bloquear({fixed: true});
                    });
                    window.focus();
                    window.addEventListener("keydown", popupClick);
                    

                    const popupDimensions = popupInDocument.getBoundingClientRect();
                    if ((event.pageX + popupDimensions.width) > window.innerWidth - popupDimensions.width) popupInDocument.style.left = (event.pageX + 14) + 'px';
                    if ((event.pageY + popupDimensions.height) > window.innerHeight - popupDimensions.height) popupInDocument.style.top = (event.pageY + 14) + 'px';
                } else {
                    desativar();
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            desativar();
        }
    }, timeoutValue);
}
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("Message received:", request);
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

    return true;
});
async function popupClick(event) {
    if((event && event.keyCode == 66) || window.event.type == 'click') {
        const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
        const bloqueado = localStorage.getItem('inspetor_visual_bloqueado') == 'true' || bloqueioResult.inspetor_visual_bloqueado;
        const bloqueio = document.getElementById("insp_visual_bloquear");
        const bloqueador = document.getElementById("insp_visual_bloqueador");
        const popup = document.getElementById("inspetor-visual-popup");
        if(!(bloqueio && bloqueador && popup)) {
            return;
        }
        if(bloqueado && popup.style.position == "sticky") {
            desbloquear(event);
        } else {
            bloquear(event);
        }
    }
}
function desbloquear() {
    const bloqueio = document.getElementById("insp_visual_bloquear");
    const popup = document.getElementById("inspetor-visual-popup");

    chrome.storage.local.set({'inspetor_visual_bloqueado': false});
    localStorage.setItem('inspetor_visual_bloqueado', false);
    if(bloqueio) {
        bloqueio.style.display = 'none';
    }
    clearTimeout(timeout);
    if(popup) {
        popup.style.top = "";
        popup.style.right = "";
        popup.style.bottom = "";
        popup.style.left = "";
        popup.style.position = "fixed";
        popup.onmouseenter = null;
        popup.onmouseleave = null;
    }
}
function bloquear(settings) {
    const bloqueio = document.getElementById("insp_visual_bloquear");
    const popup = document.getElementById("inspetor-visual-popup");
    
    chrome.storage.local.set({'inspetor_visual_bloqueado': true});
    localStorage.setItem('inspetor_visual_bloqueado', true);
    bloqueio.style.display = 'block';
    window.addEventListener('beforeunload', ()=>{
        const bloqueado = document.getElementById(popupId) && localStorage.getItem('inspetor_visual_bloqueado') == 'true';

        if(bloqueado) {
            chrome.storage.local.set({'inspetor_visual_bloqueado': false});
            localStorage.setItem('inspetor_visual_bloqueado', false);
        }
    });
    clearTimeout(timeout);
    popup.style.opacity = ".9";
    if(!settings || settings && !settings.fixed) {
        popup.style.top = "";
        popup.style.right = "";
        popup.style.bottom = "0%";
        popup.style.left = "100%";
        popup.style.position = "sticky";
    }
    popup.onmouseover = () => {
        popup.style.opacity = "1";
    }
    popup.onmouseleave = () => {
        popup.style.opacity = ".9";
    }
}
function toHex(n) {
    return Number(n).toString(16).padStart(2, '0');
}
function rgbaToHex(rgba) {
    let rgbaSplit = rgba.split(','), r, g, b;
    if (rgbaSplit[0] && rgbaSplit[1] && rgbaSplit[2]) {
        r = rgbaSplit[0].trim().replace('rgba(', '').replace('rgb(', '');
        g = rgbaSplit[1].trim();
        b = rgbaSplit[2].trim().replace(')', '');
        let a = '';
        if (rgbaSplit[0].includes('a') && rgbaSplit[3]) {
            a = toHex(parseInt(rgbaSplit[3].trim().replace(')', '') * 255));
            color = rgba;
        } else {
            color = '#' + toHex(r) + toHex(g) + toHex(b);
        }

        return color;
    }
    return '';
}
console.log(rgbaToHex('rgba(255,255,135, 1)'));
function getCssStyles(elemento) {
    const estilos = getComputedStyle(elemento);
    let css = "";

    for (prop in elemento.style) {
        if (isNaN(prop) && 
        elemento.style[prop] && 
        prop != 'length' && 
        prop != 'cssText' && 
        prop != 'item' && 
        prop != 'getProperty' && 
        prop != 'setProperty' && 
        prop != 'getPropertyPriority' && 
        prop != 'getPropertyValue' && 
        prop != 'removeProperty') {
            css += camelParaHifen(prop) + ': ' + elemento.style[prop] + ';\n';
        }

    }

    return css;
}
function camelParaHifen(texto) {
  return texto
    // Adiciona um hífen antes de qualquer letra maiúscula
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    // Converte toda a string para minúsculas
    .toLowerCase();
}
function desativar() {
    visitedElements.forEach((elem) => {
        elem.style.border = "";
        elem.onmouseover = null;
        elem.onmouseout = null;
    });
    visitedElements = [];
    window.mousemove = null;
    const popup = document.getElementById('inspetor-visual-popup');
    if (popup) popup.remove();
}
async function speak(text) {
    if ('speechSynthesis' in window) {
        cancelSpeak();
        const result = await chrome.storage.local.get(["voz"]);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 2.0;
        utterance.pitch = 0.5;
        if (result.voz) {
            utterance.voice = speechSynthesis.getVoices()[result.voz];
        }

        speechSynthesis.speak(utterance);
    } else {
        console.info('Desculpe, seu navegador não suporta a API Web Speech.');
    }
}
document.addEventListener('mouseleave', async () => {
    if(!chrome.storage) {
        return;
    }
    const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
    const bloqueado = (document.getElementById(popupId) && localStorage.getItem('inspetor_visual_bloqueado') == 'true') || bloqueioResult.inspetor_visual_bloqueado;
    if(!bloqueado)
        cancelSpeak();
})

function cancelSpeak() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    } else {
        console.info('Desculpe, seu navegador não suporta a API Web Speech.');
    }
}