console.log("Content script carregado!");
let copyBuffer = {};
let visitedElements = [];
const timeoutValue = 200;
let timeout = setTimeout(()=>{},timeoutValue);
()=>(async ()=>{
    const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
    if(!localStorage.getItem('inspetor_visual_bloqueado') || localStorage.getItem('inspetor_visual_bloqueado') == 'true' || bloqueioResult.inspetor_visual_bloqueado) {
        localStorage.setItem('inspetor_visual_bloqueado', false);
    }
})();


window.oncontextmenu = async (event) => {
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
window.addEventListener('onload', async () => {
    document.body.onmouseenter = async (event) => {
        const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
        const bloqueado = localStorage.getItem('inspetor_visual_bloqueado') == 'true' || bloqueioResult.inspetor_visual_bloqueado;
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
        const popupId = 'inspetor-visual-popup';
        
        const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
        const bloqueado = localStorage.getItem('inspetor_visual_bloqueado') == 'true' || bloqueioResult.inspetor_visual_bloqueado;
        if(bloqueado || event.target.closest(popupId)) {
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

            popup.style.position = 'fixed';
            popup.style.zIndex = 9999;
            popup.style.top = (event.pageY + 14) + 'px';
            popup.style.left = (event.pageX + 14) + 'px';
            popup.style.width = 'fit-content';
            popup.style.minWidth = '100px';
            popup.style.height = 'fit-content';
            popup.style.backgroundColor = 'rgba(0,0,0,.5)';
            popup.style.color = 'white';
            popup.style.padding = '14px';
            popup.style.fontSize = '12px';

            try {
                const element = event.target;
                if (element != null) {
                    const estilos = getComputedStyle(element);
                    const dimensoes = element.getBoundingClientRect();
                    if (element.innerText) {
                        await chrome.storage.local.set({ inner_text_copy: false });
                        if (speakerResult.insp_visual_leitor_de_tela == true) {
                            speak(element.innerText);
                        }
                        innerHTML += '<strong>' + element.innerText.split(' ')[0] +
                            (element.innerText.split(' ')[1] ? ' ' + element.innerText.split(' ')[1] : '') +
                            (element.innerText.split(' ')[2] ? ' ' + element.innerText.split(' ')[2] : '') +
                            '</strong>'
                    }
                    innerHTML += '<div>selector: ' + ((element.id || estilos.getPropertyValue('id') ? '#' +
                        (element.id || estilos.getPropertyValue('id')) : ''));

                    if ((!(element.id || estilos.getPropertyValue('id')) && element.className || estilos.getPropertyValue('className'))) {
                        if (element.classList.length) {
                            const className = Object.assign([], element.classList).map((v) => '.' + v).join(' ');
                            innerHTML += className;
                            innerHTML += '</div>';
                            innerHTML += '<div>class: ' + className + '</div>';
                        }
                    } else {
                        innerHTML += element.localName;
                        innerHTML += '</div>';
                    }
                    const width = (Math.abs(parseFloat(element.style.width || estilos.getPropertyValue('width')).toFixed(2)));
                    const height = (Math.abs(parseFloat(element.style.height || estilos.getPropertyValue('height')).toFixed(2)));
                    innerHTML += '<div>width: ' + (!isNaN(width) ? width : 'não declarado') + '</div>';
                    innerHTML += '<div>height: ' + (!isNaN(height) ? height : 'não declarado') + '</div>';
                    innerHTML += '<div>dimensões: ' + Math.abs(parseFloat(dimensoes.width).toFixed(2)) + 'x' + Math.abs(parseFloat(dimensoes.height).toFixed(2));
                    if ((element.style.backgroundColor || estilos.getPropertyValue('background-color'))) innerHTML += '<div>background-color: <div style="display: inline-block; border: 2px solid lightgrey;  height: 12px; width: 12px; background-color: ' +
                        (element.style.backgroundColor || estilos.getPropertyValue('background-color')) +
                        '"></div> #' +
                        (rgbaToHex(element.style.backgroundColor || estilos.getPropertyValue('background-color'))) +
                        '</div></div>';
                    if ((element.style.color || estilos.getPropertyValue('color'))) innerHTML += '<div>color: <div style="display: inline-block; border: 2px solid lightgrey; height: 12px; width: 12px; color: ' +
                        (element.style.color || estilos.getPropertyValue('color')) +
                        '"></div> #' +
                        (rgbaToHex(element.style.color || estilos.getPropertyValue('color'))) +
                        '</div></div>';
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
                if (result.insp_visual_ligado == true) {
                    let popupInDocument = document.getElementById(popupId);
                    if (!popupInDocument) {
                        document.body.appendChild(popup);
                        popupInDocument = document.getElementById(popup.id);
                        innerHTML += '<div tabindex="0" id="insp_visual_bloqueador" class="text-center" style="color: yellow"><a class="text-decoration-none" href="#" style="color: yellow !important" onclick="event.preventDefault()"><strong>(B) Bloquear<span id="insp_visual_bloquear" style="display: none"> (bloqueado)</span></strong></a></div>'
                        popupInDocument.innerHTML = innerHTML;
                    }
                    window.focus();
                    window.addEventListener("keydown", popupClick);
                    

                    const popupDimensions = popupInDocument.getBoundingClientRect();
                    if ((event.pageX + popupDimensions.width) > window.innerWidth - popupDimensions.width) popupInDocument.style.left = (event.pageX - window.scrollX + 14) + 'px';
                    if ((event.pageY + popupDimensions.height) > window.innerHeight - popupDimensions.height) popupInDocument.style.top = (event.pageY - window.scrollY + 14) + 'px';
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
    if(event.keyCode == 66) {
        const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
        const bloqueado = localStorage.getItem('inspetor_visual_bloqueado') == 'true' || bloqueioResult.inspetor_visual_bloqueado || bloqueioResult.inspetor_visual_bloqueado;
        const bloqueio = document.getElementById("insp_visual_bloquear");
        if(bloqueado) {
            chrome.storage.local.set({'inspetor_visual_bloqueado': false});
            localStorage.setItem('inspetor_visual_bloqueado', false);
            bloqueio.style.display = 'none';
            clearTimeout(timeout);
        } else {
            chrome.storage.local.set({'inspetor_visual_bloqueado': false});
            localStorage.setItem('inspetor_visual_bloqueado', true);
            bloqueio.style.display = 'block';
            clearTimeout(timeout);
        }
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
        if (rgbaSplit[0].includes('a') && rgbaSplit[3]) a = toHex(parseInt(rgbaSplit[3].trim().replace(')', '') * 255));

        return toHex(r) + toHex(g) + toHex(b) + a;
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
            css += prop + ': ' + elemento.style[prop] + ';\n';
        }

    }

    return css;
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
    const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
    const bloqueado = localStorage.getItem('inspetor_visual_bloqueado') == 'true' || bloqueioResult.inspetor_visual_bloqueado;
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