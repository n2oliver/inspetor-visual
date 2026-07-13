import { ordinais } from "./ordinais.js";
import { abreviacoes } from "./abreviacoes.js";

const cancelSpeak = () => {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    } else {
        console.info('Desculpe, seu navegador não suporta a API Web Speech.');
    }
}

const speak = async (text) => {
    if ('speechSynthesis' in window) {
        cancelSpeak();
        for (const [regex, substituicao] of abreviacoes) {
            text = text.replace(regex, substituicao);
        }
        text = text.replace(
            /(?<!\d)(10|[1-9])(?:\s*\.?\s*)([ºoªa])(?!\d)/gi,
            (_, numero, genero) => {
                const feminino = genero === "ª" || genero.toLowerCase() === "a";
                return ordinais[numero][feminino ? 1 : 0];
            }
        );
        const result = await chrome.storage.local.get(["voz"]);
        const utterance = new SpeechSynthesisUtterance(capitalizeSentences(text));
        utterance.lang = 'pt-BR';
        utterance.rate = 1.6;
        utterance.pitch = 1.25;
        if (result.voz) {
            utterance.voice = speechSynthesis.getVoices()[result.voz];
        }

        speechSynthesis.speak(utterance);
    } else {
        console.info('Desculpe, seu navegador não suporta a API Web Speech.');
    }
}

function capitalizeSentences(texto) {
    return texto.replace(
        /(^|[.!?]\s+)([a-zà-ÿ])/gi,
        (_, inicio, letra) => inicio + letra.toUpperCase()
    );
}

export { speak, cancelSpeak };