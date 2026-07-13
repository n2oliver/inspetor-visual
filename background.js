chrome.runtime.onStartup.addListener(createMenus);
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({insp_visual_ligado: true});
  await chrome.storage.local.set({insp_visual_bloquear_ao_sobrepor: true});
  await chrome.storage.local.set({insp_visual_leitor_de_tela: false});
  await chrome.storage.local.set({insp_visual_ocultar: false});
  await chrome.storage.local.set({inspetor_visual_bloqueado: false});

  createMenus();
});
async function createMenus () {
  const result = await chrome.storage.local.get(["insp_visual_ligado"]);
  if(result.insp_visual_ligado == true) {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
          id: "copiarTexto",
          title: "Copiar texto",
          contexts: ["page"]
      });
      chrome.contextMenus.create({
          id: "copiarElemento",
          title: "Copiar HTML + CSS",
          contexts: ["page"]
      });
      chrome.contextMenus.create({
          id: "copiarHTML",
          title: "Copiar HTML",
          contexts: ["page"]
      });
      chrome.contextMenus.create({
          id: "copiarCSS",
          title: "Copiar CSS",
          contexts: ["page"]
      });
    });
  }
};
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const result = await chrome.storage.local.get(["insp_visual_ligado"]);
  if(result.insp_visual_ligado == true) {
    if (tab.status === 'complete') {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {}
      });
      if (info.menuItemId === "copiarTexto") {
        // Envia uma mensagem para a aba atual pedindo para copiar texto do elemento
        chrome.tabs.sendMessage(tab.id, { action: "copiarTexto", targetElementId: info.targetElementId },
          (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
          }
        );
      }
      if (info.menuItemId === "copiarElemento") {
        // Envia uma mensagem para a aba atual pedindo para copiar o elemento
        chrome.tabs.sendMessage(tab.id, { action: "copiarElemento", targetElementId: info.targetElementId },
          (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
          }
        );
      }
      if (info.menuItemId === "copiarHTML") {
        // Envia uma mensagem para a aba atual pedindo para copiar o html do elemento
        chrome.tabs.sendMessage(tab.id, { action: "copiarHTML", targetElementId: info.targetElementId },
          (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
          }
        );
      }
      if (info.menuItemId === "copiarCSS") {
        chrome.tabs.sendMessage(tab.id, { action: "copiarCSS", targetElementId: info.targetElementId },
          (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
          }
        );
      }
    }
  }
});
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
  });
  const tabId = tab.id;

  if(message.action == "salvarTabId") {
    chrome.storage.local.set({tabId: tab.id});
  }
  if(message.action == "desbloquear") {
    chrome.tabs.sendMessage(tab.id, { action: "desbloquear", targetElementId: message.dados.targetElementId },
      (response) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }
      }
    );
  }
  sendResponse({
      tabId
  });

  return true;
});