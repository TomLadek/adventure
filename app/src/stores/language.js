import { ref } from "vue";
import { defineStore } from "pinia";

const langKey = "lang";

export const useLanguageStore = defineStore("language", () => {
    let language = ref((window.localStorage[langKey] || navigator.language.substring(0, 2)).toLowerCase());

    function setLanguage(lang) {
        language.value = lang;
        window.localStorage[langKey] = lang;
    };

    return { language, setLanguage };
});
