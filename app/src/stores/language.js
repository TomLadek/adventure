import { ref } from "vue";
import { defineStore } from "pinia";

const langKey = "adventure_lang";

export const useLanguageStore = defineStore("language", () => {
    let language = ref(typeof window === "object" ? window.localStorage[langKey] : "en");

    function setLanguage(lang) {
        language.value = lang;

        if (typeof window === "object") {
            document.documentElement.lang = lang;
            window.localStorage[langKey] = lang;
        }
    };

    return { language, setLanguage };
});
