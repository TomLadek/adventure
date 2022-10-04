<script>
import { useLanguageStore } from "../stores/language.js";
import { useI18n } from "vue-i18n";
</script>

<script setup>
const languageStore = useLanguageStore();

const { locale, availableLocales } = useI18n()

if (availableLocales.indexOf(languageStore.language) >= 0)
  locale.value = languageStore.language;

function setLang(lang) {
  locale.value = lang;
  languageStore.setLanguage(lang);
}
</script>

<template>
<div class="lang-switcher">
  <button v-for="lang in availableLocales" @click="setLang(lang)" class="lang" :class="languageStore.language === lang ? 'active' : ''">{{lang.toUpperCase()}}</button>
</div>
</template>

<style>
.lang-switcher {
  display: flex;
  position: absolute;    
  top: 1rem;
  right: 1rem;
  z-index: 1;
}
.lang-switcher button {
  background: transparent;
  border: none;
  color: unset;
}
.lang-switcher button.active {
  font-weight: bold;
}
</style>
