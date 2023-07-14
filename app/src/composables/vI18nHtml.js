/**
 * Using this composable will add a v-i18n-html template directive. Directives
 * are normally not evaluated in SSR which makes this useful when the language
 * of the app depends on the client. During SSR this particular directive
 * doesn't set the element's HTML, however it adds a "data-empty-text"
 * attribute that can be used for styling, e.g. to indicate that some space
 * will be filled with text content eventually.
 * 
 * Initialize this composable with the vue-i18n "t" function.
 * 
 * The usage syntax is:
 * 
 * <div v-i18n-html:[locale]="textModule"></div>
 * 
 * The directive will then set the innerHTML property of the div element to the
 * translated text referenced in "textModule".
 * 
 * Adding the vue-i18n "locale" arg ensures that this directive is evaluated
 * every time the client's locale changes.
 */

export function useVI18nHtml(t) {
  function getTranslatedHtml(binding) {
    const { textModule, isMultiline } = binding;

    if (!textModule)
      return "";

    const translation = t(textModule);

    if (!translation || translation === textModule)
      return "";

    return !isMultiline || /<p>.*<\/p>/.test(translation) ? translation : `<p>${translation}</p>`
  }

  return {
    vI18nHtml: {
      mounted(el, binding) {
        el.innerHTML = getTranslatedHtml(binding.value);
        delete el.dataset["emptyText"];
      },
      updated(el, binding) {
        el.innerHTML = getTranslatedHtml(binding.value);
      },
      getSSRProps(a, b) {
        return {
          "data-empty-text": true
        };
      }
    }
  }
}