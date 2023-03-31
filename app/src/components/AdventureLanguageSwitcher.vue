<script>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useLanguageStore } from "../stores/language.js";
</script>

<script setup>
const languageStore = useLanguageStore();

const { locale, availableLocales } = useI18n()

const languages = computed(() => { return availableLocales.sort() });

if (languages.value.indexOf(languageStore.language) >= 0)
  locale.value = languageStore.language;

function setLang(lang) {
  locale.value = lang;
  languageStore.setLanguage(lang);
}
</script>

<template>
<div class="lang-switcher" v-if="languages.length > 1">
  <button v-for="lang in languages" @click="setLang(lang)" class="lang" :class="{ active: languageStore.language === lang }">{{lang.toUpperCase()}}</button>
</div>
</template>

<style>
.lang-switcher {
  display: flex;
  position: absolute;    
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
}

.lang-switcher button {
  padding: 0.3rem;
  background: transparent;
  border: none;
  border-radius: 5px;
  color: unset;
}

.lang-switcher button.active {
  font-weight: bold;
  transition: backdrop-filter var(--default-anim-time) ease;
}

.lang-switcher button.active {
  backdrop-filter: brightness(0.8);
}

.dark .lang-switcher button.active {
  backdrop-filter: brightness(0.92);
}
</style>
