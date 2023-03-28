<script>
import { defineEmits, onMounted, onUnmounted, ref, computed } from "vue";

// import ButtonClose from "./ButtonClose.vue";
</script>

<script setup>
const emit = defineEmits(["closing"]);

function closePopup() {
  emit("closing");
}

function confirm() {
  closePopup();
}

function onKeyUp(e) {
  if (e.key === "Escape")
    closePopup()
}

function addLanguage(lang) {
  if (newAdventureData.value.langs.indexOf(lang) < 0)
    newAdventureData.value.langs.push(lang);
}

function removeLanguage(lang) {
  const langIdx = newAdventureData.value.langs.indexOf(lang);

  if (langIdx > -1)
    newAdventureData.value.langs.splice(langIdx, 1);
}

const newAdventureData = ref({
    langs: [],
    title: "",
    urlPath: "",
    author: "",
    authorText: ""
  }),
  availableLangs = ["aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "gv", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ii", "ik", "in", "io", "is", "it", "iu", "ja", "ji", "jv", "ka", "kg", "ki", "kj", "kk", "kl", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mo", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sd", "se", "sg", "sh", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zu"];

const inputClass = computed(() => {
  return {
    multilingual: newAdventureData.value.langs.length > 1
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
      <h2>New Adventure</h2>
      <div class="cms-new-adventure-fields">
          <label for="input-languages">Languages:</label>
          <ul class="field-value chips-values">
            <li class="chip-container" v-for="(lang) in newAdventureData.langs">
              <button class="chip" @click="removeLanguage(lang)">{{ lang }}</button>
            </li>
            <li class="chip-container new-lang-chip-container">
              <button class="chip">+</button>
              <select @change="addLanguage($event.target.value)">
                <option value=""></option>
                <option v-for="(lang) in availableLangs" :value="lang">{{ lang }}</option>
              </select>
            </li>
          </ul>
          <label for="input-title">Title:</label>
          <div class="field-value-container" :class="inputClass">
            <input type="text" class="field-value" id="input-title" v-model="newAdventureData.title">
          </div>
          <label for="input-url-path">URL path:</label>
          <div class="field-value-container" :class="inputClass">
            <input type="text" class="field-value" id="input-url-path" v-model="newAdventureData.urlPath">
          </div>
          <label for="input-url-author">Author:</label>
          <div class="field-value-container" :class="inputClass">
            <input type="text" class="field-value" id="input-url-author" v-model="newAdventureData.author">
          </div>
          <label for="input-url-author-text">Text author(s):</label>
          <div class="field-value-container" :class="inputClass">
            <input type="text" class="field-value" id="input-url-author-text" v-model="newAdventureData.authorText">
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

.cms-new-adventure-fields-container h2 {
  margin-bottom: 2rem;
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
}

.cms-new-adventure-fields .field-value-container:last-child {
  margin-bottom: 0;
}

@media(min-width: 600px) {
  .cms-new-adventure-fields .field-value-container {
    margin-bottom: 0;
  }
}

.cms-new-adventure-fields .field-value-container.multilingual::after {
  content: "multilingual";
  position: absolute;
  right: calc(1rem / 8);
  top: calc(1rem / 8);
  font-size: 0.6em;
}

.cms-new-adventure-fields .field-value.chips-values {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.2rem;
  min-height: 2.5rem;
  height: 100%;
  list-style: none;
  margin: 0;
  padding-right: 0;
  padding-left: 0;
}

.cms-new-adventure-fields .field-value .chip {
  position: relative;
  border: 1px solid #787878;
  border-radius: 8px;
  padding: calc(3rem / 16) 0.6rem;
  background: none;
  font: inherit;
}

.cms-new-adventure-fields .field-value .chip:hover::after,
.cms-new-adventure-fields .field-value .chip:focus::after {
  content: '×';
  position: absolute;
  right: 1px;
  top: 3px;
  color: #787878;
}

.cms-new-adventure-fields .field-value .chip-container {
  position: relative;
}

.cms-new-adventure-fields .field-value .new-lang-chip-container select {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  cursor: pointer;
}

.cms-new-adventure-fields .field-value .new-lang-chip-container .chip {
  border: 1px dashed #787878;
  color: #787878;
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