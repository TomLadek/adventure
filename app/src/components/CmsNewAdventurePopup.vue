<script>
import { defineEmits, onMounted, onUnmounted, ref, computed, watch } from "vue";

import CmsPopup from "./CmsPopup.vue";
import CmsPopupActionButtons from "./CmsPopupActionButtons.vue";
import languages from "../languages.js";
</script>

<script setup>
const props = defineProps({
  adventure: {
    required: false,
    type: Object
  },
  popupShowing: {
    required: true,
    type: Boolean
  }
});
const emit = defineEmits(["closing"]);

function closePopup() {
  emit("closing");
}

function confirm() {
  // Not using FormData here because multiLangData is an object and the serialization into JSON POST/PUT data doesn't seem to work automatically
  const data = {
    urlPath: newAdventureData.value.urlPath,
    title: newAdventureData.value.title,
    author: newAdventureData.value.author,
    authorText: newAdventureData.value.authorText,
    activeLang: activeLang.value,
    fallbackLang: newAdventureData.value.langs.length ? newAdventureData.value.langs[0] : null,
    multiLangData: Object.entries(newAdventureDataMultilang).reduce((prev, curr) => {
      if (newAdventureData.value.langs.indexOf(curr[0]) > -1 && curr[0] !== activeLang.value)
        prev[curr[0]] = curr[1];

      return prev;
    }, {})
  };

  if (props.adventure && props.adventure.id) {
    fetch(`/rest/adventure/${props.adventure.id}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(closePopup)
  } else {
    fetch("/rest/adventure/create", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(closePopup);
  }
}

function onKeyUp(e) {
  if (e.key === "Escape")
    closePopup();
}

function addLanguage(lang) {
  if (newAdventureData.value.langs.indexOf(lang) < 0)
    newAdventureData.value.langs.push(lang);

  if (newAdventureData.value.langs.length > 0 && activeLang.value === "")
    activeLang.value = newAdventureData.value.langs[0];
}

function removeLanguage(lang) {
  const langIdx = newAdventureData.value.langs.indexOf(lang);

  if (langIdx > -1)
    newAdventureData.value.langs.splice(langIdx, 1);

  if (activeLang.value === lang) {
    if (newAdventureData.value.langs.length > 0)
      switchActiveLang(newAdventureData.value.langs[0]);
    else
      switchActiveLang("");
  }
}

function switchActiveLang(lang) {
  if (!newAdventureDataMultilang[activeLang.value])
    newAdventureDataMultilang[activeLang.value] = {};

  newAdventureDataMultilang[activeLang.value].title = newAdventureData.value.title;
  newAdventureDataMultilang[activeLang.value].author = newAdventureData.value.author;
  newAdventureDataMultilang[activeLang.value].authorText = newAdventureData.value.authorText;

  activeLang.value = lang;

  newAdventureData.value.title = newAdventureDataMultilang[lang] ? newAdventureDataMultilang[lang].title : "";
  newAdventureData.value.author = newAdventureDataMultilang[lang] ? newAdventureDataMultilang[lang].author : "";
  newAdventureData.value.authorText = newAdventureDataMultilang[lang] ? newAdventureDataMultilang[lang].authorText : "";
}

function existingAdventureToNewAdventureData(adventure) {
  function getTranslatedText(messages, module, lang) {
    if (messages[lang] && typeof messages[lang][module] !== "undefined")
      return messages[lang][module];
    else
      return module;
  }

  const langs = adventure && adventure.messages && Object.keys(adventure.messages) || [];
  
  newAdventureData.value.langs = langs;
  newAdventureData.value.urlPath = adventure && adventure.meta.urlPath || "";

  if (adventure && adventure.meta.fallbackLang) {
    const fallbackLang = adventure.meta.fallbackLang;

    langs.sort((langA, langB) => {
      if (langA === fallbackLang)
        return -1;
      if (langB === fallbackLang)
        return 1;
      return 0;
    });
  }

  if (langs.length > 0) {
    for (let i = langs.length - 1; i >= 0; i--) {
      const lang = langs[i];
  
      newAdventureData.value.title = adventure && adventure.meta.title && getTranslatedText(adventure.messages, adventure.meta.title, lang) || "";
      newAdventureData.value.author = adventure && adventure.meta.author.madeBy && getTranslatedText(adventure.messages, adventure.meta.author.madeBy, lang) || "";
      newAdventureData.value.authorText = adventure && adventure.meta.author.content && getTranslatedText(adventure.messages, adventure.meta.author.content, lang) || "";
      activeLang.value = lang;
  
      switchActiveLang(lang);
    }
  } else {
    newAdventureData.value.title = "";
    newAdventureData.value.author = "";
    newAdventureData.value.authorText = "";
    activeLang.value = "";
  }

}

function isLongLang(lang){
  return /zh-/.test(lang);
} 

const newAdventureData = ref({
    langs: [],
    title: "",
    urlPath: "",
    author: "",
    authorText: ""
  }),
  newAdventureDataMultilang = {},
  activeLang = ref(""),
  availableLangs = languages;

const multilingualClass = computed(() => {
  return {
    multilingual: newAdventureData.value.langs.length > 1,
    long: isLongLang(activeLang.value)
  };
});

onMounted(() => {
  addEventListener("keyup", onKeyUp);
});

onUnmounted(() => {
  removeEventListener("keyup", onKeyUp);
});

// Modify the entered urlPath
watch(() => newAdventureData.value.urlPath, urlPathVal => {
  // Don't allow slashes or spaces
  if (/\/|\s/.test(urlPathVal))
    newAdventureData.value.urlPath = urlPathVal.replace(/\/|\s/g, "");

  // Don't allow uppercase characters
  if (/\p{Uppercase}/gu.test(urlPathVal))
    newAdventureData.value.urlPath = urlPathVal.toLowerCase();
});

watch(() => props.adventure, existingAdventureToNewAdventureData);
</script>

<template>
  <CmsPopup :popupShowing="popupShowing">
    <div class="cms-new-adventure-header">
      <h2>{{ adventure ? 'Edit' : 'New' }} Adventure</h2>

      <select
        v-if="newAdventureData.langs.length > 3"
        class="cms-new-adventure-lang-switcher"
        :value="activeLang"
        @change="switchActiveLang($event.target.value)"
      >
        <option v-for="(lang) in newAdventureData.langs" :value="lang">{{ lang }}</option>
      </select>

      <ul v-else-if="newAdventureData.langs.length > 1" class="cms-new-adventure-lang-switcher">
        <li v-for="(lang) in newAdventureData.langs" class="cms-new-adventure-lang-item">
          <button
            class="cms-new-adventure-lang"
            :class="{ active: activeLang === lang, long: isLongLang(lang) }"
            @click="switchActiveLang(lang)"
          >{{ lang }}</button>
        </li>
      </ul>
    </div>

    <div class="cms-adventure-popup-fields">
      <label for="input-languages">Languages:</label>
      <ul class="field-value-container chips-values">
        <li class="chip-container chosen-lang-chip-container" v-for="(lang, i) in newAdventureData.langs">
          <button class="chip chosen-lang-chip" :class="{ 'fallback-lang': i === 0 }" @click="removeLanguage(lang)" :title="`${availableLangs.filter(l => l.code === lang)[0].name}${(i === 0 ? ' (fallback language)' : '')}`">{{ lang }}</button>
        </li>
        <li class="chip-container new-lang-chip-container">
          <button class="chip new-lang-chip">+</button>
          <select @change="addLanguage($event.target.value)">
            <option v-for="(lang) in availableLangs" :value="lang.code">{{ lang.name }} ({{ lang.code }})</option>
          </select>
        </li>
      </ul>

      <label for="input-title">Title:</label>
      <div class="field-value-container">
        <span class="active-lang" :class="{ long: isLongLang(activeLang) }" v-if="newAdventureData.langs.length > 1">{{ activeLang }}</span>
        <input type="text" class="field-value" :class="multilingualClass" id="input-title" v-model="newAdventureData.title">
      </div>

      <label for="input-url-author">Author:</label>
      <div class="field-value-container">
        <span class="active-lang" :class="{ long: isLongLang(activeLang) }" v-if="newAdventureData.langs.length > 1">{{ activeLang }}</span>
        <input type="text" class="field-value" :class="multilingualClass" id="input-url-author" v-model="newAdventureData.author">
      </div>

      <label for="input-url-author-text">Text author(s):</label>
      <div class="field-value-container">
        <span class="active-lang" :class="{ long: isLongLang(activeLang) }" v-if="newAdventureData.langs.length > 1">{{ activeLang }}</span>
        <input type="text" class="field-value" :class="multilingualClass" id="input-url-author-text" v-model="newAdventureData.authorText">
      </div>

      <label for="input-url-path">URL path:</label>
      <div class="field-value-container">
        <input type="text" class="field-value" id="input-url-path" v-model="newAdventureData.urlPath">
      </div>
    </div>

    <CmsPopupActionButtons @confirm="confirm" @cancel="closePopup" />
  </CmsPopup>
</template>

<style>
.cms-new-adventure-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.cms-new-adventure-header h2 {
  margin: 0;
}

.cms-new-adventure-header ul.cms-new-adventure-lang-switcher {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 1rem;
}

.cms-new-adventure-header select.cms-new-adventure-lang-switcher {
  font: inherit;
}

.cms-new-adventure-header .cms-new-adventure-lang-switcher .cms-new-adventure-lang {
  display: inline-block;
  position: relative;
  border: none;
  background: none;
  font-size: inherit;
  padding: 0;
  width: 1.5em;
}

.cms-new-adventure-header .cms-new-adventure-lang-switcher .cms-new-adventure-lang-item {
  position: relative;
}

.cms-new-adventure-header .cms-new-adventure-lang-switcher .cms-new-adventure-lang-item:not(:last-child)::after {
  content: "|";
  position: absolute;
  right: -0.6rem;
  font-weight: initial;
}

.cms-new-adventure-header .cms-new-adventure-lang-switcher .cms-new-adventure-lang.active {
  font-weight: bold;
}

.cms-new-adventure-header .cms-new-adventure-lang-switcher .cms-new-adventure-lang.long {
  width: 3.8rem;
}

@media(min-width: 600px) {
  .cms-adventure-popup-fields {
    display: grid;
    gap: 1rem;
    grid-template-columns: auto 1fr;
    align-items: center;
  }
}

.cms-adventure-popup-fields label {
  display: block;
  height: 100%;
  margin-bottom: calc(6rem / 16);
}

@media(min-width: 600px) {
  .cms-adventure-popup-fields label {
    margin: 0;
    display: flex;
    align-items: center;
  }
}

.cms-adventure-popup-fields .field-value-container {
  position: relative;
  width: 100%;
  height: 2.5rem;
  margin-bottom: 1rem;
}

.cms-adventure-popup-fields .field-value {
  width: 100%;
  height: 100%;
  padding: 0.25rem 0.5rem;
  font-size: 1em;
  box-sizing: border-box;
  border: 1px solid #767676
}

.cms-adventure-popup-fields .field-value.multilingual {
  padding-right: 2em;
}

.cms-adventure-popup-fields .field-value.multilingual.long {
  padding-right: 3.7em;
}

.cms-adventure-popup-fields .field-value-container:last-child {
  margin-bottom: 0;
}

@media(min-width: 600px) {
  .cms-adventure-popup-fields .field-value-container {
    margin-bottom: 0;
  }
}

.cms-adventure-popup-fields .field-value-container.chips-values {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.2rem;
  min-height: 2.5rem;
  height: 100%;
  list-style: none;
  margin: 0;
  margin-bottom: 1rem;
  padding-right: 0;
  padding-left: 0;
}

@media(min-width: 600px) {
  .cms-adventure-popup-fields .field-value-container.chips-values {
    margin-bottom: 0;
  }
}

.cms-adventure-popup-fields .field-value-container .chip {
  position: relative;
  width: 3.5rem;
  border: 1px solid #787878;
  border-radius: 8px;
  padding: calc(3rem / 16) 0.6rem;
  background: none;
  font: inherit;
}

.cms-adventure-popup-fields .field-value-container .fallback-lang {
  box-shadow: 0px 0px 0px 1px white;
}

.cms-adventure-popup-fields .field-value-container .chip-container:not(:last-child) .chip::after {
  content: '×';
  position: absolute;
  right: 3px;
  top: 3px;
  color: #787878;
}

.cms-adventure-popup-fields .field-value-container .chip-container {
  position: relative;
}

.cms-adventure-popup-fields .field-value-container .new-lang-chip-container select {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  cursor: pointer;
}

.cms-adventure-popup-fields .field-value-container .new-lang-chip-container .chip {
  border: 1px dashed #787878;
  color: #787878;
}

.cms-adventure-popup-fields .field-value-container .active-lang {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  width: 2em;
  height: calc(100% - 2px);
  margin: 1px 1px 1px 0;
  background: #555454;
  pointer-events: none;
  opacity: 0.5;
  font-size: 0.8em;
}

.cms-adventure-popup-fields .field-value-container .active-lang.long {
  width: 4.2em;
}
</style>