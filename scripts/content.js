import { extractText, getDocumentProxy } from "unpdf";
const fileFieldId = "file-field";
const playButtonId = "ouvir-pdf";
const pauseButtonId = "pausar-pdf";
async function lerPDF(url, from, to) {
    const input = document.getElementById(fileFieldId);
    let file = input.files[0];
    let fileBytes;
    if(window.location.protocol == 'file:' && !window.location.href.endsWith(file.name)) {
        alert("Para uma boa leitura, lembre-se de selecionar o mesmo .pdf que está aberto no navegador.");
    }
    try {
        if(window.location.protocol == 'file:') {
            fileBytes = await file.arrayBuffer();
        }
        // Fetch a PDF from the web or load it from the file system
        const buffer = window.location.protocol != 'file:' ? await fetch(url)
            .then(res => res.arrayBuffer()) : fileBytes;
        
        if(!buffer) {
            return;
        }
        const pdf = await getDocumentProxy(new Uint8Array(buffer));


        const speakerResult = await chrome.storage.local.get(["insp_visual_leitor_de_tela"]);
        if (speakerResult.insp_visual_leitor_de_tela == true) {
            let mergePages = true;
            if(!from && !to) {
                mergePages = true;
            } else {
                mergePages = false;
            }
            const { totalPages, text } = await extractText(pdf, {mergePages});
            let finalText = text;
            if(from || to) {
                finalText = "";
                for(let i = from ? parseInt(from) : 0; i <= (to ? parseInt(to) : text.length); i++) {
                    finalText += text[i-1];
                }
            }
            speak(finalText);
            bloquear();
        }
        
    } catch(e) {
        alert("Primeiro selecionE o .pdf no campo 'Escolher arquivo'.");
        document.getElementById(playButtonId).style.display = "block";
        document.getElementById(pauseButtonId).style.display = "none";
        
        return;
    }
}

let copyBuffer = {};
let visitedElements = [];
const timeoutValue = 300;
const ehPDF = window.location.href.substring(window.location.href.length-4) == '.pdf';
let timeout = setTimeout(()=>{},timeoutValue);
let currentTab = {};

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
    } else if(!ehPDF){
        desativar();
    }
}
document.body.addEventListener('click', ()=>{
    const popup = document.getElementById("inspetor-visual-popup");

    if(popup && !event.target.closest('#'+popupId) && popup.style.position != 'sticky' && !ehPDF) {
        desbloquear();
    }
});
window.addEventListener('load', async () => {
    if(!chrome.storage) {
        return;
    }
    
    currentTab = await chrome.storage.local.get(['tabId']);
    
    window.focus();
    window.addEventListener("keydown", eventos);

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
                desbloquear();
                desativar();
                window.onmousemove = null;
                window.focus();

                const livroStyles = {
                    width: "108px",
                    height: "66px",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 108 66'%3E%3Cpath d='M2 6 Q28 1 54 9 Q80 1 106 6 V58 Q80 53 54 64 Q28 53 2 58 Z' fill='white' stroke='%23666' stroke-width='1.5'/%3E%3Cline x1='54' y1='9' x2='54' y2='64' stroke='%23666' stroke-width='1.5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    position: "fixed",
                    bottom: "68px",
                    right: "8px"
                };

                const deStyles = {
                    position: "absolute",
                    left: "4px",
                    top: "20px",
                    width: "40px",
                    textAlign: "center",
                }
                const ateStyles = {
                    position: "absolute",
                    left: "56px",
                    top: "20px",
                    width: "40px",
                    textAlign: "center",
                }

                const playStyles = {
                    width: '60px',
                    height: '60px',
                    backgroundColor: 'darkgreen',
                    color: 'forestgreen',
                    position: 'fixed',
                    borderRadius: '50%',
                    bottom: '0px',
                    right: '0px',
                    marginRight: '8px',
                    marginBottom: '8px',
                    outline: 'outset',
                }
                
                const pauseStyles = {
                    width: '60px',
                    height: '60px',
                    backgroundColor: 'orange',
                    color: 'darkorange',
                    position: 'fixed',
                    borderRadius: '50%',
                    bottom: '0px',
                    right: '0px',
                    marginRight: '8px',
                    marginBottom: '8px',
                    outline: 'outset',
                    display: 'none'
                }
                
                const stopStyles = {
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'darkred',
                    color: 'red',
                    position: 'fixed',
                    borderRadius: '50%',
                    bottom: '0px',
                    right: '72px',
                    marginRight: '8px',
                    marginBottom: '8px',
                    outline: 'outset',
                }

                const fileStyles = {
                    position: "fixed",
                    bottom: "142px",
                    right: "-156px",
                    color: "transparent",
                };

                const playButton = document.createElement('div');
                const pauseButton = document.createElement('div');
                const stopButton = document.createElement('div');
                const livro = document.createElement('div');
                const de = document.createElement('input');
                const ate = document.createElement('input');
                const fileField = document.createElement('input');

                playButton.id = playButtonId;
                playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"
     width="60"
     height="60"
     viewBox="0 0 24 24"
     fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
             10-4.48 10-10S17.52 2 12 2zm-2 14V8l6 4-6 4z"/>
</svg>`;
                
                Object.assign(playButton.style, playStyles);
                document.body.appendChild(playButton);
                const playButtonElement = document.getElementById(playButton.id);

                pauseButton.id = pauseButtonId;
                pauseButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"
     width="60"
     height="60"
     viewBox="0 0 24 24"
     fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-4 5h3v10H8zm5 0h3v10h-3z"/>
</svg>`;
                
                Object.assign(pauseButton.style, pauseStyles);
                document.body.appendChild(pauseButton);
                const pauseButtonElement = document.getElementById(pauseButton.id);

                stopButton.id = 'parar-de-ouvir';
                stopButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"
     width="48"
     height="48"
     viewBox="0 0 24 24"
     fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-4 6h8v8H8z"/>
</svg>`;
                Object.assign(stopButton.style, stopStyles);
                document.body.appendChild(stopButton);

                livro.id = "livro";
                Object.assign(livro.style, livroStyles);
                document.body.appendChild(stopButton);

                de.id = "de";
                de.type = "number";
                Object.assign(de.style, deStyles);
                
                ate.id = "ate";
                ate.type = "number";
                Object.assign(ate.style, ateStyles);

                livro.appendChild(de);
                livro.appendChild(ate);

                document.body.appendChild(livro);

                fileField.id = fileFieldId;
                fileField.type = "file";
                fileField.accept = "application/pdf";
                fileField.innerHTML = `<label for="${fileFieldId}"></label>`;

                Object.assign(fileField.style, fileStyles);

                if(!window.location.href.startsWith("file:")) {
                    fileField.style.display = "none";
                }
                
                document.body.appendChild(fileField);
                
                playButtonElement.addEventListener('click', (event)=>{
                    playButtonElement.style.display = 'none';
                    pauseButtonElement.style.display = 'block';
                    if(window.speechSynthesis.paused) {
                        window.speechSynthesis.resume();
                        return;
                    }
                    const deElement = document.getElementById(de.id);
                    const ateElement = document.getElementById(ate.id);
                    lerPDF(window.location.href, deElement.value, ateElement.value);
                });
                pauseButtonElement.addEventListener('click', (event)=>{
                    pauseButtonElement.style.display = 'none';
                    playButtonElement.style.display = 'block';
                    window.speechSynthesis.pause();
                });
                document.getElementById(stopButton.id).addEventListener('click', (event)=>{
                    pauseButtonElement.style.display = 'none';
                    playButtonElement.style.display = 'block';
                    cancelSpeak();
                });

                return;
            }
            if(bloqueado) {
                return;
            }
            const result = await chrome.storage.local.get(["insp_visual_ligado"]);
            const speakerResult = await chrome.storage.local.get(["insp_visual_leitor_de_tela"]);
            if (chrome.storage && chrome.storage.local && !!chrome?.runtime?.id && 
                result.insp_visual_ligado == true) {

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
                        if (speakerResult.insp_visual_leitor_de_tela == true) {
                            speak(element.innerText);
                        }
                    }
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
                            padding: 0;"
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
                            padding: 0;"
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
                                    padding: 0;"
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
                            padding: 0;"
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
                            padding: 0;"
                            onclick="navigator.clipboard.writeText(this.textContent)">${(!isNaN(height) ? height + 'px' : 'não declarado') + copyIcon}</pre>
                        </div>`;
                    innerHTML += `<div style="display: flex; white-space: nowrap; justify-content: space-between; margin-bottom: 4px;"><strong>Dimensões:</strong> 
                    <pre style="
                        background-color: lightgrey;
                        width: fit-content;
                        padding-left: .25rem !important;
                        padding-right: .25rem !important;
                        text-color: black;
                        border-radius: 5px;
                        margin: 0; border: solid 1px gray;
                        padding: 0;"
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
                                    align-items: center"
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
                                    align-items: center"
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
                if (result.insp_visual_ligado == true) {
                    
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
                        eventos();
                    });
                    popupInDocument.querySelector("#inspetor_visual_ocultar").addEventListener("click", ()=>{
                        event.preventDefault();
                        eventos();
                    });
                    popupInDocument.addEventListener("mouseenter", async ()=>{
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
            } else {
                desativar();
            }
        } catch (e) {
            console.log(e);
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
    if (request.action === "desbloquear") {
        desbloquear();
    }

    return true;
});
async function eventos(event) {
    if((event && event.keyCode == 66) || 
        (window.event.type == 'click' && window.event.target.id == "inspetor_visual_link_bloqueador") || 
            window.event.target.closest('#inspetor_visual_link_bloqueador')) {
        const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
        const bloqueado = localStorage.getItem('inspetor_visual_bloqueado') == 'true' || bloqueioResult.inspetor_visual_bloqueado;
        const bloqueio = document.getElementById("insp_visual_bloquear");
        const bloqueador = document.getElementById("insp_visual_bloqueador");
        const popup = document.getElementById("inspetor-visual-popup");
        if(!(bloqueio && bloqueador && popup)) {
            const tab = await chrome.storage.local.get(['tabId']);
            if(tab.tabId == currentTab.tabId || (event && event.keyCode == 66)) {
                desbloquear(event);
            }
            return;
        }
        if(bloqueado && popup.style.position == "sticky") {
            const tab = await chrome.storage.local.get(['tabId']);
            if(tab.tabId == currentTab.tabId || (event && event.keyCode == 66)) {
                desbloquear(event);
            }
        } else {
            chrome.runtime.sendMessage({
                action: "salvarTabId",
                dados: true
            }, (resposta) => {
                console.log(resposta);
            });
            bloquear(event);
        }
    }
    if((event && event.keyCode == 79) || 
        (window.event && window.event.type == 'click' && window.event.target.id == "inspetor_visual_ocultar" || 
            window.event.target.closest('#inspetor_visual_ocultar'))) {
        const hideState = await chrome.storage.local.get(['insp_visual_ocultar']);
        if(hideState.insp_visual_ocultar) {
            chrome.storage.local.set({insp_visual_ocultar: false});
        } else {
            chrome.storage.local.set({insp_visual_ocultar: true});
            chrome.storage.local.set({inspetor_visual_bloqueado: false});
            localStorage.setItem("inspetor_visual_bloqueado", false);
        }
    }
}
function desbloquear() {
    const bloqueio = document.getElementById("insp_visual_bloquear");
    const popup = document.getElementById("inspetor-visual-popup");

    if(!chrome.storage) {
        return;
    }

    chrome.storage.local.set({'inspetor_visual_bloqueado': false});
    localStorage.setItem('inspetor_visual_bloqueado', false);
    
    if(bloqueio) bloqueio.style.display = 'none';

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
    
    if(!chrome.storage) {
        return;
    }

    chrome.storage.local.set({'inspetor_visual_bloqueado': true});
    localStorage.setItem('inspetor_visual_bloqueado', true);

    if(bloqueio) bloqueio.style.display = 'block';

    window.addEventListener('beforeunload', ()=>{
        const bloqueado = document.getElementById(popupId) && localStorage.getItem('inspetor_visual_bloqueado') == 'true';

        if(!chrome.storage) {
            return;
        }

        if(bloqueado) {
            chrome.storage.local.set({'inspetor_visual_bloqueado': false});
            localStorage.setItem('inspetor_visual_bloqueado', false);
        }
    });
    clearTimeout(timeout);
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

    return css || estilos.cssText;
}
function camelParaHifen(texto) {
  return texto
    // Adiciona um hífen antes de qualquer letra maiúscula
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    // Converte toda a string para minúsculas
    .toLowerCase();
}
function desativar() {
    limpar();
    window.mousemove = null;
}
function limpar() {
    visitedElements.forEach((elem) => {
        elem.style.border = "";
        elem.onmouseover = null;
        elem.onmouseout = null;
    });
    visitedElements = [];
    const popup = document.getElementById('inspetor-visual-popup');
    if (popup) popup.remove();
}
async function speak(text) {
    if ('speechSynthesis' in window) {
        cancelSpeak();
        const result = await chrome.storage.local.get(["voz"]);
        const utterance = new SpeechSynthesisUtterance(text.replace(/-\n/gi, '').replace(/\n/gi, ' '));
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
    try {
        if(!chrome.storage) {
            return;
        }
        const bloqueioResult = await chrome.storage.local.get(['inspetor_visual_bloqueado']);
        const bloqueado = (document.getElementById(popupId) && localStorage.getItem('inspetor_visual_bloqueado') == 'true') || bloqueioResult.inspetor_visual_bloqueado;
        if(!bloqueado && !ehPDF)
            cancelSpeak();
    } catch (e) {
        console.log(e);
    }
})

function cancelSpeak() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    } else {
        console.info('Desculpe, seu navegador não suporta a API Web Speech.');
    }
}