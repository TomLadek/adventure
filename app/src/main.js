import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { createPinia } from "pinia";
import App from "./App.vue";

import mergeDeep from "./utils.js";

import "./assets/main.css";
import slidesData from "./assets/data/slides.json";

const slideLanguages = Object.keys(slidesData.messages);

const app = createApp(App, {
    slidesData: slidesData.slides,
    languages: slideLanguages
});

const defaultMessages = {
    de: {
        "misc.zoom": "Zoom",
        "misc.close": "Schließen",
        "misc.previous": "Vorheriges",
        "misc.next": "Nächstes",
        "misc.error.imageunloadable": "Dieses Bild konnte nicht geladen werden."
    },
    cs: {
        "misc.zoom": "Zoom",
        "misc.close": "Zavřít",
        "misc.previous": "Předchozí",
        "misc.next": "Další",
        "misc.error.imageunloadable": "Tento obrázek nebylo možné zobrazit."
    },
    en: {
        "misc.zoom": "Zoom",
        "misc.close": "Close",
        "misc.previous": "Previous",
        "misc.next": "Next",
        "misc.error.imageunloadable": "The image cannot be loaded."
    }
};

for (let lang of Object.keys(defaultMessages)) {
    if (slideLanguages.indexOf(lang) < 0)
        delete defaultMessages[lang];
}

app.use(createI18n({
    legacy: false,
    locale: "de",
    fallbackLocale: "de",
    warnHtmlMessage: false,
    messages: mergeDeep(slidesData.messages, defaultMessages)
}));
app.use(createPinia());

app.mount("#app");
