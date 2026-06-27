chrome.runtime.onStartup.addListener(createMenus);
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({insp_visual_ligado: true});
  createMenus();
});
async function createMenus () {
  
  const result = await chrome.storage.local.get(["insp_visual_ligado"]);
  if(result.insp_visual_ligado == true) {
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
  }
};
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const result = await chrome.storage.local.get(["insp_visual_ligado"]);
  if(result.insp_visual_ligado == true) {
    if (tab.status === 'complete') {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => console.log("Loading complete!")
      });
      if (info.menuItemId === "copiarElemento") {
        // Envia uma mensagem para a aba atual pedindo para copiar o elemento
        chrome.tabs.sendMessage(tab.id, { action: "copiarElemento", targetElementId: info.targetElementId },
          (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }

            console.log(response);
          }
        );
      }
      if (info.menuItemId === "copiarHTML") {
        // Envia uma mensagem para a aba atual pedindo para copiar o elemento
        chrome.tabs.sendMessage(tab.id, { action: "copiarHTML", targetElementId: info.targetElementId },
          (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }

            console.log(response);
          }
        );
      }
      if (info.menuItemId === "copiarCSS") {
        // Envia uma mensagem para a aba atual pedindo para copiar o elemento
        chrome.tabs.sendMessage(tab.id, { action: "copiarCSS", targetElementId: info.targetElementId },
          (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }

            console.log(response);
          }
        );
      }
    }
    console.log(tab.status);
  }
});