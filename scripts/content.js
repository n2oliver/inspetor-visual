console.log("Content script carregado!");
let copyBuffer = {};

let visitedElements = [];

window.oncontextmenu = async (event) => {
    const result = await chrome.storage.local.get(["insp_visual_ligado"]);
    if(result.insp_visual_ligado == true) {
        try {
            copyBuffer = Object.assign(event.target, {});
            let i = 0;
            while(document.querySelector("#inspetor-visual-copiado-"+i)) {
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
window.addEventListener('onload', () => {
    document.body.onmouseenter = async (event) => {
        const result = await chrome.storage.local.get(["insp_visual_ligado"]);
        if(result.insp_visual_ligado == false) {
            desativar();
        } else {
            window.onmousemove = mousemove;
        }
    }
});

window.onmousemove = mousemove;

async function mousemove (event) {
    
    const result = await chrome.storage.local.get(["insp_visual_ligado"]);

    let oldPopup = document.getElementById('inspetor-visual-popup');
    let innerHTML = '';
    const popup = document.createElement('div');
    
    if(oldPopup) {
        oldPopup.remove();
        delete oldPopup;
    }

    popup.id = 'inspetor-visual-popup';

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
        if(element != null) {
            const estilos = getComputedStyle(element);
            const dimensoes = element.getBoundingClientRect();

            innerHTML += '<div>selector: ' + (((element.id || estilos.getPropertyValue('id') ? '#' : '') + 
            (element.id || estilos.getPropertyValue('id'))) || 
            ((element.className || estilos.getPropertyValue('className')).split(' ').map((v)=> '.' + v).join(' ')))  + '</div>';
            innerHTML += '<div>class: ' + element.className.split(' ').map((v)=> '.' + v).join(' ');
            innerHTML += '<div>width: ' + (Math.abs(parseFloat(element.style.width || estilos.getPropertyValue('width')).toFixed(2))) + '</div>';
            innerHTML += '<div>height: ' + (Math.abs(parseFloat(element.style.height || estilos.getPropertyValue('height')).toFixed(2))) + '</div>';
            innerHTML += '<div>dimensões: ' + Math.abs(parseFloat(dimensoes.width).toFixed(2)) + 'x' + Math.abs(parseFloat(dimensoes.height).toFixed(2));
            if((element.style.backgroundColor || estilos.getPropertyValue('background-color'))) innerHTML += '<div>background-color: <div style="display: inline-block; border: 2px solid lightgrey;  height: 12px; width: 12px; background-color: ' + 
                (element.style.backgroundColor || estilos.getPropertyValue('background-color')) + 
                '"></div> #' + 
                (rgbaToHex(element.style.backgroundColor || estilos.getPropertyValue('background-color'))) + 
                '</div></div>';
            if((element.style.color || estilos.getPropertyValue('color'))) innerHTML += '<div>color: <div style="display: inline-block; border: 2px solid lightgrey; height: 12px; width: 12px; color: ' + 
                (element.style.color || estilos.getPropertyValue('color')) + 
                '"></div> #' + 
                (rgbaToHex(element.style.color || estilos.getPropertyValue('color'))) + 
                '</div></div>';
            popup.innerHTML = innerHTML;

            if(!visitedElements.includes(element)) {
                visitedElements.push(element);
            }
            
            if(result.insp_visual_ligado == true) {
                element.onmouseover = (event) => {
                    element.style.border = "2px dashed blue";
                    if(element.parent) {
                        if(!visitedElements.includes(element.parent)) {
                            visitedElements.push(element.parent);
                        }

                        const parentElement = element.parent;
                        parentElement.onmouseover = (parentEvent) => {
                            parentElement.style.border = "12px dashed blue";
                        }
                        parentElement.onmouseout = (parentEvent) => {
                            parentElement.style.border = "";
                        }
                    }
                }
                element.onmouseout = (event) => {
                    element.style.border = "";
                }
            } else {
                element.style.border = "";
                
                if(element.parent) {
                    parentElement.style.border = "";
                }
                desativar();
            }
        }
        setTimeout(()=>{
            if(result.insp_visual_ligado == true) {
                let popupInDocument = document.getElementById(popup.id);
                if(!popupInDocument) {
                    document.body.appendChild(popup);
                    popupInDocument = document.getElementById(popup.id);
                } else 
                    popupInDocument.innerHTML = innerHTML;
                
                const popupDimensions = popupInDocument.getBoundingClientRect();
                if((event.pageX + popupDimensions.width) > window.innerWidth - popupDimensions.width) popupInDocument.style.left = (event.pageX - window.scrollX + 14) + 'px';
                if((event.pageY + popupDimensions.height) > window.innerHeight - popupDimensions.height) popupInDocument.style.top = (event.pageY - window.scrollY + 14) + 'px';
            } else {
                desativar();
            }
        }, 50);
    } catch (e) {
        console.log(e);
    }
}
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("Message received:", request);
    sendResponse({ status: "success" }); 
    if (request.action === "copiarElemento") {
        copyBuffer.style.border = "";

        let i = 0
        for(const element of copyBuffer.children) {
            element.id = "#"+ copyBuffer.id + "-filho-" + i;
        }

        let textoParaCopiar = copyBuffer.outerHTML + "<style>#" + copyBuffer.id + " {" + getCssStyles(copyBuffer) + "}\n\n";
        
        i = 0
        for(const element of copyBuffer.children) {
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
        for(const element of copyBuffer.children) {
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
function toHex(n) {
    return Number(n).toString(16).padStart(2, '0');
}
function rgbaToHex(rgba) {
    let rgbaSplit = rgba.split(','), r, g, b;
    if(rgbaSplit[0] && rgbaSplit[1] && rgbaSplit[2]) {
        r = rgbaSplit[0].trim().replace('rgba(', '').replace('rgb(', '');
        g = rgbaSplit[1].trim();
        b = rgbaSplit[2].trim().replace(')', '');
        let a = '';
        if(rgbaSplit[0].includes('a') && rgbaSplit[3]) a = toHex(parseInt(rgbaSplit[3].trim().replace(')', '') * 255));

        return toHex(r) + toHex(g) + toHex(b) + a;
    }
    return '';
}
console.log(rgbaToHex('rgba(255,255,135, 1)'));
function getCssStyles(elemento) {
    const estilos = getComputedStyle(elemento);

    if (estilos.cssText) {
        return estilos.cssText;
    }

    let cssTexto = '';

    for (const prop of estilos) {
        const value = estilos.getPropertyValue(prop);
        if(value.substring(0,1) != '--') {
            cssTexto += `${prop}: ${value};\n`;
        }
    }

    return cssTexto;
}
function desativar() {
    visitedElements.forEach((elem) => {
        elem.style.border = "";
        elem.onmouseover = null;
        elem.onmouseout = null;
    });
    window.mousemove = null;
}