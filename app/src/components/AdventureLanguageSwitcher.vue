<script>
import { useLanguageStore } from "@/stores/language.js";
import { getCurrentInstance } from 'vue'
</script>

<script setup>
const languageStore = useLanguageStore();
const i18n = getCurrentInstance().root.ctx.$i18n; // Ugly hack, TODO find a better solution
const props = defineProps({
  langs: {
    type: Array,
    required: true
  }
});

if (props.langs.indexOf(languageStore.language) >= 0)
  i18n.locale = languageStore.language;

function setLang(lang) {
  i18n.locale = lang;
  languageStore.setLanguage(lang);
}
</script>

<template>
<div class="lang-switcher">
  <button v-for="lang in langs" @click="setLang(lang)" class="lang" :class="languageStore.language === lang ? 'active' : ''">{{lang.toUpperCase()}}</button>
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
