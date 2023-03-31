<script>
import { defineEmits, onMounted, onUnmounted, ref, computed } from "vue";

import languages from "../languages.js";

// import ButtonClose from "./ButtonClose.vue";
</script>

<script setup>
const emit = defineEmits(["closing"]);

function closePopup() {
  emit("closing");
}

function confirm() {
  const data = {
    urlPath: newAdventureData.value.urlPath,
    title: newAdventureData.value.title,
    author: newAdventureData.value.author,
    authorText: newAdventureData.value.authorText,
    activeLang: activeLang.value,
    multiLangData: Object.entries(newAdventureDataMultilang).reduce((prev, curr) => {
      if (newAdventureData.value.langs.indexOf(curr[0]) > -1 && curr[0] !== activeLang.value)
        prev[curr[0]] = curr[1];

      return prev;
    }, {})
  };

  fetch("/rest/adventure/create", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  closePopup();
}

function onKeyUp(e) {
  if (e.key === "Escape")
    closePopup()
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

const isLongLang = (lang) => /zh-/.test(lang)

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
  }
})

onMounted(() => {
  addEventListener("keyup", onKeyUp);
})

onUnmounted(() => {
  removeEventListener("keyup", onKeyUp);
})
</script>

<template>
<div class="cms-new-adventure-popup">
  <div class="cms-new-adventure-popup-content">
    <!-- <ButtonClose class="popup-button-close" @close-click="closePopup" /> -->

    <div class="cms-new-adventure-fields-container">
      <div class="cms-new-adventure-header">
        <h2>New Adventure</h2>
  
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

      <div class="cms-new-adventure-fields">
        <label for="input-languages">Languages:</label>
        <ul class="field-value-container chips-values">
          <li class="chip-container" v-for="(lang) in newAdventureData.langs">
            <button class="chip" @click="removeLanguage(lang)">{{ lang }}</button>
          </li>
          <li class="chip-container new-lang-chip-container">
            <button class="chip">+</button>
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

      <div class="cms-new-adventure-actions">
        <button class="button-ok" @click="confirm">OK</button>
        <button class="button-cancel" @click="closePopup">Cancel</button>
      </div>
    </div>
  </div>
</div>
</template>

<style>
.cms-new-adventure-popup {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #00000036;
}

.cms-new-adventure-popup-content {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(30rem, 80vw);
  transform: translate(-50%, -50%);
  border-radius: 32px;
  background: #fff;
  box-shadow: 0px 0px 32px 0px #686868;
}

/*
.popup-button-close {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
}
*/

.cms-new-adventure-fields-container {
  padding: 2rem;
}

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
  .cms-new-adventure-fields {
    display: grid;
    gap: 1rem;
    grid-template-columns: auto 1fr;
    align-items: center;
  }
}

.cms-new-adventure-fields label {
  display: block;
  height: 100%;
  margin-bottom: calc(6rem / 16);
}

@media(min-width: 600px) {
  .cms-new-adventure-fields label {
    margin: 0;
    display: flex;
    align-items: center;
  }
}

.cms-new-adventure-fields .field-value-container {
  position: relative;
  width: 100%;
  height: 2.5rem;
  margin-bottom: 1rem;
}

.cms-new-adventure-fields .field-value {
  width: 100%;
  height: 100%;
  padding: 0.25rem 0.5rem;
  font-size: 1em;
  box-sizing: border-box;
  border: 1px solid #767676
}

.cms-new-adventure-fields .field-value.multilingual {
  padding-right: 2em;
}

.cms-new-adventure-fields .field-value.multilingual.long {
  padding-right: 3.7em;
}

.cms-new-adventure-fields .field-value-container:last-child {
  margin-bottom: 0;
}

@media(min-width: 600px) {
  .cms-new-adventure-fields .field-value-container {
    margin-bottom: 0;
  }
}

.cms-new-adventure-fields .field-value-container.chips-values {
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
  .cms-new-adventure-fields .field-value-container.chips-values {
    margin-bottom: 0;
  }
}

.cms-new-adventure-fields .field-value-container .chip {
  position: relative;
  border: 1px solid #787878;
  border-radius: 8px;
  padding: calc(3rem / 16) 0.6rem;
  background: none;
  font: inherit;
}

.cms-new-adventure-fields .field-value-container .chip:hover::after,
.cms-new-adventure-fields .field-value-container .chip:focus::after {
  content: '×';
  position: absolute;
  right: 1px;
  top: 3px;
  color: #787878;
}

.cms-new-adventure-fields .field-value-container .chip-container {
  position: relative;
}

.cms-new-adventure-fields .field-value-container .new-lang-chip-container select {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  cursor: pointer;
}

.cms-new-adventure-fields .field-value-container .new-lang-chip-container .chip {
  border: 1px dashed #787878;
  color: #787878;
}

.cms-new-adventure-fields .field-value-container .active-lang {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  width: 2em;
  height: calc(100% - 2px);
  margin: 1px 1px 1px 0;
  background: #e9e9e9;
  pointer-events: none;
  opacity: 0.5;
  font-size: 0.8em;
}

.cms-new-adventure-fields .field-value-container .active-lang.long {
  width: 4.2em;
}

.cms-new-adventure-actions {
  display: flex;
  justify-content: end;
  gap: 0.5rem;
  margin-top: 2rem;
}

.cms-new-adventure-actions button {
  border: 1px solid #787878;
  border-radius: 8px;
  background: none;
  padding: 12px;
  font-size: 1em;
}

.cms-new-adventure-actions button.button-ok {
  background-color: rgba(0, 255, 21, 0.178);
}

.cms-new-adventure-actions button.button-ok:active {
    background-color: rgb(0 145 12 / 18%);
}

.cms-new-adventure-actions button.button-cancel:active {
    background-color: rgba(145, 0, 0, 0.18);
}
</style>