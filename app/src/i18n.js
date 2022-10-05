import { createI18n } from "vue-i18n";
import { useLanguageStore } from "./stores/language.js";
import mergeDeep from "./utils.js";


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

export function initI18n(messages) {
  const availableLangs = Object.keys(messages);
  const languageStore = useLanguageStore();
  const userLang = (languageStore.language || navigator.language).substring(0, 2).toLowerCase();

  for (let lang of Object.keys(defaultMessages)) {
    if (availableLangs.indexOf(lang) < 0)
      delete defaultMessages[lang];
  }

  languageStore.setLanguage(availableLangs.indexOf(userLang) >= 0 ? userLang : availableLangs[0]);

  return createI18n({
    legacy: false,
    locale: languageStore.language,
    fallbackLocale: availableLangs[0],
    warnHtmlMessage: false,
    messages: mergeDeep(messages, defaultMessages)
  });
}