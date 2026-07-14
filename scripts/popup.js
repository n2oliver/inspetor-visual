import { speak, cancelSpeak } from "./speaker.js";
let currentTab = {};
const buildPopUp = async (event, popupId, copyBuffer, visitedElements, bloqueado, timeoutValue, timeout) => {
    let innerHTML = '';
    const popup = document.createElement('div');

    popup.id = popupId;
    popup.classList.add(popupId)
    const styles = {
        width: 'fit-content',
        height: 'fit-content',
        backgroundColor: 'rgba(191, 249, 255, .93)',
        border: 'solid 1px rgb(14, 8, 95)',
        position: 'fixed',
        top: (event.clientY + 14) + 'px',
        left: (event.clientX + 14) + 'px',
        zIndex: 99999999,
        minWidth: '100px',
        padding: '14px',
        color: 'rgb(14, 8, 95)',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: window.innerWidth,
        maxHeight: window.innerHeight,
    }

    const element = event.target;
    if (element != null) {
        if (element.innerText) {
            await chrome.storage.local.set({ inner_text_copy: element.innerText });

            const speakerResult = await chrome.storage.local.get(["insp_visual_leitor_de_tela"]);
            if (speakerResult.insp_visual_leitor_de_tela == true) {
                speak(element.innerText);
            }
        }
        
        const ocultarResult = await chrome.storage.local.get(['insp_visual_ocultar']);
        if(ocultarResult.insp_visual_ocultar) {
            return;
        }
        const estilos = getComputedStyle(element);
        const dimensoes = element.getBoundingClientRect();
        copyBuffer = element.cloneNode(true);
        copyBuffer.style = getCssStyles(element);
        copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
viewBox="0 0 24 24" fill="currentColor">
<path d="M16 1H4C2.9 1 2 1.9 2 3v12h2V3h12V1zm4 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h12v14z"/>
</svg>`
        innerHTML += '<div style="margin-bottom: 4px; max-width: 320px;  max-height: 240px; overflow: auto;" onclick="navigator.clipboard.writeText(`' + copyBuffer.outerHTML.replace(/"/gi, '\'') + `\`)">${ copyBuffer.outerHTML }${copyIcon}</div>`;
        innerHTML += `<div style="display: flex; white-space: nowrap; justify-content: space-between; margin-bottom: 4px;"><strong>ID:</strong>
            <pre style="
                background-color: lightgrey;
                width: fit-content;
                padding-left: .25rem !important;
                padding-right: .25rem !important;
                text-color: black;
                border-radius: 5px;
                margin: 0;
                border: solid 1px gray;
                padding: 0;
                white-space: wrap;"
                onclick="navigator.clipboard.writeText(this.textContent)">${(
                    (element.id || estilos.id ? '#' + (element.id || estilos.id) : '(vazio)')
                )}${copyIcon}</pre></div>`;
            
        innerHTML += `<div style="display: flex; white-space: nowrap; justify-content: space-between; margin-bottom: 4px;"><strong>Tagname:</strong> 
            <pre style="
                background-color: lightgrey;
                width: fit-content;
                padding-left: .25rem !important;
                padding-right: .25rem !important;
                text-color: black;
                border-radius: 5px;
                margin: 0;
                border: solid 1px gray;
                padding: 0;
                white-space: wrap;"
                onclick="navigator.clipboard.writeText(this.textContent)">${element.localName + copyIcon}</pre>
            </div>`;
        
        if((!(element.id || estilos.id) && element.className || estilos.className)) {
            if(element.classList.length) {
                const className = Object.assign([], element.classList).map((v) => '.' + v).join(' ');
                innerHTML += `<div style="display: flex; white-space: nowrap; justify-content: space-between; margin-bottom: 4px;"><strong>Classname:</strong> 
                    <pre style="
                        background-color: lightgrey;
                        width: fit-content;
                        padding-left: .25rem !important;
                        padding-right: .25rem !important;
                        text-color: black;
                        border-radius: 5px;
                        margin: 0;
                        border: solid 1px gray;
                        padding: 0;
                        white-space: wrap;"
                        onclick="navigator.clipboard.writeText(this.textContent)">${className + copyIcon}</pre>
                    </div>`;
            }
        }
        

        const width = (Math.abs(parseFloat(element.style.width || estilos.width).toFixed(2)));
        const height = (Math.abs(parseFloat(element.style.height || estilos.height).toFixed(2)));
        innerHTML += `<div style="display: flex; white-space: nowrap; justify-content: space-between; margin-bottom: 4px;"><strong>Width:</strong> 
            <pre style="
                background-color: lightgrey;
                width: fit-content;
                padding-left: .25rem !important;
                padding-right: .25rem !important;
                text-color: black;
                border-radius: 5px;
                margin: 0; border: solid 1px gray;
                padding: 0;
                white-space: wrap;"
                onclick="navigator.clipboard.writeText(this.textContent)">${(!isNaN(width) ? width + 'px' : 'não declarado') + copyIcon}</pre>
            </div>`;
        innerHTML += `<div style="display: flex; white-space: nowrap; justify-content: space-between; margin-bottom: 4px;"><strong>Height:</strong>
            <pre style="
                background-color: lightgrey;
                width: fit-content;
                padding-left: .25rem !important;
                padding-right: .25rem !important;
                text-color: black;
                border-radius: 5px;
                margin: 0;
                border: solid 1px gray;
                padding: 0;
                white-space: wrap;"
                onclick="navigator.clipboard.writeText(this.textContent)">${(!isNaN(height) ? height + 'px' : 'não declarado') + copyIcon}</pre>
            </div>`;
        innerHTML += `<div style="display: flex; white-space: nowrap; justify-content: space-between; margin-bottom: 4px;"><strong>Dimensions:</strong> 
        <pre style="
            background-color: lightgrey;
            width: fit-content;
            padding-left: .25rem !important;
            padding-right: .25rem !important;
            text-color: black;
            border-radius: 5px;
            margin: 0; border: solid 1px gray;
            padding: 0;
            white-space: wrap;"
            onclick="navigator.clipboard.writeText(this.textContent)">${
                Math.abs(parseFloat(dimensoes.width).toFixed(2)) + 
                'px x ' + 
                Math.abs(parseFloat(dimensoes.height).toFixed(2))
            }px${copyIcon}</pre>
        </div>`;
        if ((element.style.backgroundColor || estilos.backgroundColor)) {
            const bgColor = rgbaToHex(element.style.backgroundColor || estilos.backgroundColor);
            innerHTML += 
                `<div style="display: flex; white-space: nowrap; justify-content: space-between; margin-bottom: 4px;">
                    <strong>Background-color:</strong> 
                    <pre style="
                        background-color: lightgrey;
                        width: fit-content;
                        padding-left: .25rem !important;
                        padding-right: .25rem !important;
                        text-color: black;
                        border-radius: 5px;
                        margin: 0;
                        border: solid 1px gray;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        white-space: wrap;"
                        onclick="navigator.clipboard.writeText(this.textContent)"><div style="
                            display: inline-block;
                            border: 2px solid white;
                            height: 12px;
                            width: 12px;
                            background-color: ${bgColor}"></div>${bgColor + copyIcon}</pre>
                </div>`;
        }
        if ((element.style.color || estilos.color)) {
            const color = rgbaToHex(element.style.color || estilos.color);
            innerHTML += 
                `<div style="display: flex; white-space: nowrap; justify-content: space-between; margin-bottom: 4px;">
                    <strong>Color:</strong>
                    <pre style="
                        background-color: lightgrey;
                        width: fit-content;
                        padding-left: .25rem !important;
                        padding-right: .25rem !important;
                        text-color: black;
                        border-radius: 5px;
                        margin: 0;
                        border: solid 1px gray;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        white-space: wrap;"
                        onclick="navigator.clipboard.writeText(this.textContent)"><div style="
                            display: inline-block;
                            border: 2px solid white;
                            height: 12px;
                            width: 12px;
                            background-color: ${color}"></div>${color + copyIcon}</pre>
                </div>`;
        }
        innerHTML += '</div>';
        popup.innerHTML = innerHTML;

        if (!visitedElements.includes(element)) {
            visitedElements.push(element);
        }
        element.onmouseover = (event) => {
            if(bloqueado) {
                return;
            }
            if (element.parent) {
                if (!visitedElements.includes(element.parent)) {
                    visitedElements.push(element.parent);
                }

                const parentElement = element.parent;
                parentElement.onmouseover = (parentEvent) => {
                    if(bloqueado) {
                        return;
                    }
                }
                parentElement.onmouseout = (parentEvent) => {
                    if(bloqueado) {
                        return;
                    }
                }
            }
        }
        element.onmouseout = (event) => {
            if(bloqueado) {
                return;
            }
        }
    }
    if(bloqueado) {
        return;
    }
        
    let oldPopupsInDocument = document.getElementsByClassName(popupId);
    for(let old of oldPopupsInDocument) {
        old.remove();
    };
    let popupInDocument = document.getElementById(popupId);
    if (!popupInDocument && !event.target.closest(popupId)) {
        document.body.appendChild(popup);
        popupInDocument = document.getElementById(popup.id);
    }
    setTimeout(()=>{
        oldPopupsInDocument = document.getElementsByClassName(popupId);
        for(let old of oldPopupsInDocument) {
            if(old != popupInDocument) old.remove();
        };
    }, timeoutValue);
    
    Object.assign(popupInDocument.style, styles);
    innerHTML += '<div tabindex="0" id="insp_visual_bloqueador" class="text-center"><a id="inspetor_visual_ocultar" href="#" style="color: orange !important"><strong>(O) Ocultar</strong></a> <a id="inspetor_visual_link_bloqueador" class="text-decoration-none" href="#" style="color: orange !important"><strong>(B) Bloquear<span id="insp_visual_bloquear" style="' + (!bloqueado ? 'display: none' : '') + '"> (bloqueado)</span></strong></a></div>'
    popupInDocument.innerHTML = innerHTML;
    popupInDocument.querySelector("#inspetor_visual_link_bloqueador").addEventListener("click", ()=>{
        event.preventDefault();
        eventos(event, timeout, popupId);
    });
    popupInDocument.querySelector("#inspetor_visual_ocultar").addEventListener("click", ()=>{
        event.preventDefault();
        eventos(event, timeout, popupId);
    });
    popupInDocument.addEventListener("mouseenter", async ()=>{
        if(!contextoValido()) {
            return;
        }
        const lockOnOverlay = await chrome.storage.local.get(['insp_visual_bloquear_ao_sobrepor']);
        if(lockOnOverlay.insp_visual_bloquear_ao_sobrepor == true) {
            event.preventDefault();
            bloquear({fixed: true});
        }
    });

    const popupDimensions = popupInDocument.getBoundingClientRect();
    if ((event.clientX + popupDimensions.width) > window.innerWidth) popupInDocument.style.left = (event.clientX + window.pageXOffset + 14 - popupDimensions.width) + 'px';
    if ((event.clientY + popupDimensions.height) > window.innerHeight) popupInDocument.style.top = (event.clientY + window.pageYOffset + 14 - popupDimensions.height) + 'px';
    if(parseInt(document.getElementById('inspetor-visual-popup').style.left) < 0) popupInDocument.style.left = 0;
    if(parseInt(document.getElementById('inspetor-visual-popup').style.top) < 0) popupInDocument.style.top = 0;
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

    return css || estilos.cssText;
}
function camelParaHifen(texto) {
  return texto
    // Adiciona um hífen antes de qualquer letra maiúscula
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    // Converte toda a string para minúsculas
    .toLowerCase();
}

function bloquear(settings) {
    const bloqueio = document.getElementById("insp_visual_bloquear");
    const popup = document.getElementById("inspetor-visual-popup");
    
    if(!chrome.storage || !contextoValido()) {
        return;
    }

    chrome.storage.local.set({'inspetor_visual_bloqueado': true});
    localStorage.setItem('inspetor_visual_bloqueado', true);

    if(bloqueio) bloqueio.style.display = 'block';

    window.addEventListener('beforeunload', ()=>{
        const bloqueado = document.getElementById(settings.popupId) && localStorage.getItem('inspetor_visual_bloqueado') == 'true';

        if(!chrome.storage || !contextoValido()) {
            return;
        }

        if(bloqueado) {
            chrome.storage.local.set({'inspetor_visual_bloqueado': false});
            localStorage.setItem('inspetor_visual_bloqueado', false);
        }
    });
    clearTimeout(settings.timeout);
    if(popup) {
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
}

function contextoValido() {
    return !!chrome.runtime?.id;
}

async function eventos(event, timeout, popupId) {
    if(!contextoValido()) {
        return;
    }
    if((event && event.keyCode == 66) || 
        (window.event.type == 'click' && window.event.target.id == "inspetor_visual_link_bloqueador") || 
            window.event.target.closest('#inspetor_visual_link_bloqueador')) {
                
        const eventProperties = (event || window.event);
        const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
        const bloqueado = localStorage.getItem('inspetor_visual_bloqueado') == 'true' || bloqueioResult.inspetor_visual_bloqueado;
        const bloqueio = document.getElementById("insp_visual_bloquear");
        const bloqueador = document.getElementById("insp_visual_bloqueador");
        const popup = document.getElementById("inspetor-visual-popup");
        
    
        currentTab = await chrome.storage.local.get(['tabId']);
        if(!(bloqueio && bloqueador && popup)) {
            const tab = await chrome.storage.local.get(['tabId']);
            if(tab.tabId == currentTab.tabId || (eventProperties && eventProperties.keyCode == 66)) {
                desbloquear(eventProperties);
            }
            return;
        }
        if(bloqueado && popup.style.position == "sticky") {
            const tab = await chrome.storage.local.get(['tabId']);
            if(tab.tabId == currentTab.tabId || (eventProperties && eventProperties.keyCode == 66)) {
                desbloquear(eventProperties);
            }
        } else {
            chrome.runtime.sendMessage({
                action: "salvarTabId",
                dados: true
            }, (resposta) => {
            });
            settings = eventProperties;
            settings.timeout = timeout;
            settings.popupId = popupId;
            bloquear(settings);
        }
    }
    if((event && event.keyCode == 79) || 
        (window.event && window.event.type == 'click' && (window.event.target.id == "inspetor_visual_ocultar" || 
            window.event.target.closest('#inspetor_visual_ocultar')))) {
        const eventProperties = (event || window.event);
        const hideState = await chrome.storage.local.get(['insp_visual_ocultar']);
        if(hideState.insp_visual_ocultar) {
            chrome.storage.local.set({insp_visual_ocultar: false});
        } else {
            chrome.storage.local.set({insp_visual_ocultar: true});
            chrome.storage.local.set({inspetor_visual_bloqueado: false});
            localStorage.setItem("inspetor_visual_bloqueado", false);
            
            chrome.runtime.sendMessage({
                action: "ocultar",
                dados: { targetElementId: eventProperties.target.id }
            }, (resposta) => {
            });
        }
    }
}

function desbloquear(settings) {
    const bloqueio = document.getElementById("insp_visual_bloquear");
    const popup = document.getElementById("inspetor-visual-popup");

    if(!chrome.storage || !contextoValido()) {
        return;
    }

    chrome.storage.local.set({'inspetor_visual_bloqueado': false});
    localStorage.setItem('inspetor_visual_bloqueado', false);
    
    if(bloqueio) bloqueio.style.display = 'none';

    clearTimeout(settings.timeout);
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
export { buildPopUp, getCssStyles, bloquear, contextoValido, eventos, desbloquear };