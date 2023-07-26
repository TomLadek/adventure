<script>
import { onBeforeUpdate, computed } from 'vue';
import { storeToRefs } from 'pinia';

import CmsPopup from './CmsPopup.vue';
import CmsPopupActionButtons from "./CmsPopupActionButtons.vue";
import { useLinksStore } from "../stores/links.js";
</script>

<script setup>
const props = defineProps({
  linkPopupShowing: {
    type: Boolean,
    required: true
  }
});

const linksStore = useLinksStore(),
      { confirm, cancel } = linksStore,
      { linkHref, linkText } = storeToRefs(linksStore);


const linkTextPlaceholder = computed(() => {
  return (linkHref.value || "").replace(/^.*?:\/\/|[?#].*$/g, "")
});

let editOrInsert;

onBeforeUpdate(() => {
  editOrInsert = !linkHref.value || linkHref.value.trim() === "" ? "Insert" : "Edit";
})
</script>

<template>
  <!-- TODO convert to form and get return value from submit button -->
  <CmsPopup :popupShowing="linkPopupShowing" @keydown.prevent.escape="cancel">
    <h2 class="link-popup-headline">{{ editOrInsert }} link</h2>
    <div class="link-popup-content">
      <div class="input-container">
        <label for="link-text">Link text:</label>
        <input id="link-text" type="text" name="link-text" v-model="linkText" :placeholder="linkTextPlaceholder" @keyup.enter="confirm">
      </div>
      <div class="input-container">
        <label for="link-href">Link URL:</label>
        <input id="link-href" type="text" name="link-href" v-model="linkHref" @keyup.enter="confirm">
      </div>
    </div>
    <CmsPopupActionButtons @confirm="confirm" @cancel="cancel" />
  </CmsPopup>
</template>

<style>
.link-popup-headline {
  margin-bottom: 1rem;
}

.link-popup-content .input-container {
  margin-bottom: 1rem;
}

.link-popup-content input {
  display: block;
  width: 100%;
  height: 2rem;
  margin: 0.5rem 0;
  font-size: 1.15em;
  box-sizing: border-box;
}
</style>