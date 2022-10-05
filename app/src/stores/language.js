import { ref } from "vue";
import { defineStore } from "pinia";

const langKey = "adventure_lang";

export const useLanguageStore = defineStore("language", () => {
    let language = ref(window.localStorage[langKey]);

    function setLanguage(lang) {
        language.value = lang;
        document.documentElement.lang = lang;
        window.localStorage[langKey] = lang;
    };

    return { language, setLanguage };
});
