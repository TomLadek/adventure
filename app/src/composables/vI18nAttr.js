/**
 * Using this composable will add a v-i18n-attr template directive. Directives
 * are normally not evaluated in SSR which makes this useful when the language
 * of the app depends on the client. In SSR this specific directive has an
 * effect only when there is only one language available.
 * 
 * The usage syntax is:
 * 
 * <div v-i18n-attr:[locale].title="textModule"></div>
 * 
 * The directive will then set the "title" attribute on the div element by
 * getting the translated text referenced in "textModule". If the translated
 * text is undefined or empty then the attribute is not set.
 * 
 * Adding the vue-i18n "locale" arg ensures that this directive is evaluated
 * every time the client's locale changes.
 */

import { useI18n } from "vue-i18n";

export function useVI18nAttr() {
  const { t, availableLocales } = useI18n();

  function getTranslatedTextContent(value, ssr = false) {
    const translatedText = t(value);

    if (!translatedText || translatedText === value)
      return null;
  
    if (ssr)
      return translatedText;

    const dummy = document.createElement("div");
  
    dummy.innerHTML = translatedText;
  
    return dummy.textContent;
  }

  function getBindingModifier(binding) {
    return Object.keys(binding.modifiers)[0];
  }

  function setTranslatedElAttribute(el, binding) {
    if (binding.value) {
      const text = getTranslatedTextContent(binding.value);

      if (text)
        el[getBindingModifier(binding)] = text;
      else
        el.removeAttribute(getBindingModifier(binding));
    }
  }

  return {
    vI18nAttr: {
      mounted: (el, binding) => setTranslatedElAttribute(el, binding),
      updated: (el, binding) => setTranslatedElAttribute(el, binding),
      getSSRProps: (binding) => {
        if (availableLocales.length < 2 && binding.value) {
          return {
            [getBindingModifier(binding)]: getTranslatedTextContent(binding.value, true)
          }
        }
      }
    }
  }
}