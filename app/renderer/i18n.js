import { createI18n } from "vue-i18n";
import { useLanguageStore } from "../src/stores/language.js";
import { mergeDeep } from "../src/utils.js";

const defaultMessages = {
  cs: {
    "misc.zoom": "Zoom",
    "misc.close": "Zavřít",
    "misc.previous": "Předchozí",
    "misc.next": "Další",
    "misc.error.imageunloadable": "Tento obrázek nebylo možné zobrazit.",
    "misc.switchtolanguage": "Změnit jazyk na",
    "misc.activelanguage": "Aktuální jazyk"
  },
  de: {
    "misc.zoom": "Zoom",
    "misc.close": "Schließen",
    "misc.previous": "Vorheriges",
    "misc.next": "Nächstes",
    "misc.error.imageunloadable": "Dieses Bild konnte nicht geladen werden.",
    "misc.switchtolanguage": "Sprache ändern auf",
    "misc.activelanguage": "Aktive Sprache"
  },
  en: {
    "misc.zoom": "Zoom",
    "misc.close": "Close",
    "misc.previous": "Previous",
    "misc.next": "Next",
    "misc.error.imageunloadable": "The image cannot be loaded.",
    "misc.switchtolanguage": "Switch language to",
    "misc.activelanguage": "Active language"
  },
  fr: {
    "misc.zoom": "Zoom",
    "misc.close": "Fermer",
    "misc.previous": "Précédente",
    "misc.next": "Suivante",
    "misc.error.imageunloadable": "Cette image n'a pas pu être chargée.",
    "misc.switchtolanguage": "Changer la langue en",
    "misc.activelanguage": "Langage actif"
  }
};

export function initI18n(messages, fallbackLang) {
  const availableLangs = Object.keys(messages || {});
  const languageStore = useLanguageStore();
  const userLang = (languageStore.language || (typeof navigator === "object" && navigator.language) || "en").substring(0, 2).toLowerCase();

  if (availableLangs.length < 1)
    availableLangs.push("en");

  for (let lang of Object.keys(defaultMessages)) {
    if (availableLangs.indexOf(lang) < 0)
      delete defaultMessages[lang];
  }

  languageStore.setLanguage(availableLangs.includes(userLang) ? userLang : availableLangs[0]);

  return createI18n({
    legacy: false,
    locale: languageStore.language,
    fallbackLocale: fallbackLang && availableLangs.includes(fallbackLang) ? fallbackLang : availableLangs[0],
    warnHtmlMessage: false,
    messages: mergeDeep(defaultMessages, messages || {})
  });
}