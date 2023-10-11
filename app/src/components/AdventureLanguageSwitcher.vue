<script>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useLanguageStore } from "../stores/language.js";
</script>

<script setup>
const languageStore = useLanguageStore(),
      { locale, availableLocales } = useI18n();

const languages = computed(() => { return availableLocales.sort() });

// This directive is a workaround for class attribute binding not updating during DOM hydration.
// Directives are ignored during SSR and that's what we need here since the active language
// can only be determined in the browser anyway.
const vActive = (el, binding) => {
  if (binding.arg === binding.value)
    el.classList.add("active");
  else
    el.classList.remove("active");
}

if (languages.value.indexOf(languageStore.language) >= 0)
  locale.value = languageStore.language;

function setLang(lang) {
  locale.value = lang;
  languageStore.setLanguage(lang);
}
</script>

<template>
<div class="lang-switcher slide-themed" v-if="languages.length > 1">
  <button v-for="lang in languages" @click="setLang(lang)" class="lang" v-active:[lang]="languageStore.language">{{lang.toUpperCase()}}</button>
</div>
</template>

<style>
.lang-switcher {
  display: flex;
  position: fixed;    
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
}

.lang-switcher button {
  width: 2rem;
  padding: 0.3rem;
  background: transparent;
  border: none;
  border-radius: 5px;
}

.lang-switcher button.active {
  font-weight: bold;
}

.lang-switcher button.active {
  backdrop-filter: brightness(0.8);
}

.dark .lang-switcher button.active {
  backdrop-filter: brightness(0.92);
}
</style>
