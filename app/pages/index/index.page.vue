<script>
import { ref, computed } from "vue";
import { getImageUrl, getAdventureFallbackLanguage, getTextInLanguage } from "../../src/utils.js";
import CmsNewAdventurePopup from "../../src/components/CmsNewAdventurePopup.vue"
import CmsAdventureItemButtonNew from "../../src/components/buttons/CmsAdventureItemButtonNew.vue";
import CmsButtonClose from "../../src/components/buttons/CmsButtonClose.vue";
import CmsOptionsButton from "../../src/components/buttons/CmsOptionsButton.vue";
import CmsButtonDelete from "../../src/components/buttons/CmsButtonDelete.vue";
import CmsButtonProperties from "../../src/components/buttons/CmsButtonProperties.vue";
import IconBackgroundImage from "../../src/components/icons/IconBackgroundImage.vue";

// SSR
import { usePageContext } from "../../renderer/usePageContext.js";
</script>

<script setup>
const pageContext = usePageContext(),
      adventures = ref(pageContext.pageProps.adventureList),
      newAdventurePopupShowing = ref(false),
      actionsShowing = ref({}),
      timeouts = {};

const displayedAdventures = computed(() => {
  return adventures.value.filter(adventure => !adventure.meta.hideInList);
});

function updateAdventuresList() {
  fetch("/rest/adventure/list").then(async (response) => {
    if (response.status === 200) {
      const list = await response.json()
      adventures.value.splice(0, Infinity, ...list)
    }
  });
}

function newAdventurePopupClosing() {
  newAdventurePopupShowing.value = false;  
  updateAdventuresList();
}

function getAdventureLink(adventureUrlPath) {
  return `${import.meta.env.VITE_URL_BASE_CMS || ""}/${adventureUrlPath}`
}

function getAdventureListSrcSet(adventureId, slides) {
  // Take the main image either of the intro slide or, if there's no intro slide, of the first slide
  let listImage = (slides.find(slide => slide.intro) || slides[0]).mainImg.src;

  return ["320", "640", "960"]
          .map((width, i) => `${getImageUrl(adventureId, listImage, width)} ${i + 1}x`)
          .join(",");
}

function getAllAdventureTitles(adventure) {
  const fallbackLang = getAdventureFallbackLanguage(adventure.meta, adventure.messages),
        adventureTitleInFallbackLang = getTextInLanguage(adventure, adventure.meta.title, "", true);

  return Object.keys(adventure.messages).reduce((prev, curr) => {
    const adventureTitleInCurrLang = getTextInLanguage(adventure, adventure.meta.title, curr);

    if (curr === fallbackLang || !adventureTitleInCurrLang)
      return prev;

    if (prev)
      prev += "\r\n";

    return prev + `[${curr.toUpperCase()}] ${adventureTitleInCurrLang}`;
  }, adventureTitleInFallbackLang ? `[${fallbackLang.toUpperCase()}] ${adventureTitleInFallbackLang}` : null);
}

function onActionsMouseEnter(id) {
  clearTimeout(timeouts[id]);
}

function onActionsMouseLeave(id) {
  timeouts[id] = setTimeout(() => actionsShowing.value[id] = false, 1000);
}
</script>

<template>
  <main id="index">
    <h1 class="cms-adventures-hdl">Adventures</h1>
    <ul class="cms-adventure-list">
      <li v-for="adventure in displayedAdventures" :key="adventure.id" class="cms-adventure-list-item">
        <a :href="getAdventureLink(adventure.meta.urlPath)" class="cms-adventure-link" :data-adventure-id="adventure.id">
          <picture v-if="adventure.slides && adventure.slides.length">
            <img class="cms-adventure-list-item-image" :srcset="getAdventureListSrcSet(adventure.id, adventure.slides)">
          </picture>
          <IconBackgroundImage v-else class="cms-adventure-list-item-missingimage"/>
          <div class="cms-adventure-list-item-info">
            <span class="cms-adventure-list-item-title" :title="getAllAdventureTitles(adventure)">{{ getTextInLanguage(adventure, adventure.meta.title, "", true) }}</span>
            <div class="cms-adventure-actions-container" :aria-expanded="actionsShowing[adventure.id]" @mouseenter="onActionsMouseEnter(adventure.id)" @mouseleave="onActionsMouseLeave(adventure.id)">
              <CmsOptionsButton v-if="!actionsShowing[adventure.id]" class="cms-adventure-actions-button" @click.stop.prevent="actionsShowing[adventure.id] = true"/>
              <CmsButtonClose v-else class="cms-adventure-actions-button" @click.stop.prevent="actionsShowing[adventure.id] = false"/>
              <CmsButtonDelete v-if="actionsShowing[adventure.id]" class="cms-adventure-actions-button" delete-what-text="adventure" @click.stop.prevent />
              <CmsButtonProperties v-if="actionsShowing[adventure.id]" class="cms-adventure-actions-button" what-properties="Adventure" @click.stop.prevent />
            </div>
          </div>
        </a>
      </li>
      <li class="cms-adventure-list-item new-item">
        <CmsAdventureItemButtonNew @click="newAdventurePopupShowing = true" />
      </li>
    </ul>
  </main>

  <CmsNewAdventurePopup :popupShowing="newAdventurePopupShowing" @closing="newAdventurePopupClosing" />
</template>

<style>
:root {
  --adventure-list-item-width: 20rem;
  --adventure-list-item-height: 11.25rem;
}

main#index {
  padding: 3rem;
}

.cms-adventures-hdl {
  text-align: center;
  margin-bottom: 4rem;
}

.cms-adventure-list {
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--adventure-list-item-width));
  justify-content: center;
}

.cms-adventure-list-item {
  width: var(--adventure-list-item-width);
  height: var(--adventure-list-item-height);
  background-color: rgb(206, 206, 206);
  border-radius: 0.7rem;
}

.cms-adventure-list-item.new-item {
  background-color: white;
  border: 2px dashed #CCCCCC;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.cms-adventure-list-item .cms-adventure-link {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  color: black;
  text-decoration: none;
  overflow: hidden;
  border-radius: 0.7rem;
}

.cms-adventure-list-item .cms-adventure-list-item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease-out;
}

.cms-adventure-list-item .cms-adventure-link:hover .cms-adventure-list-item-image {
  transform: scale(1.04);
}

.cms-adventure-list-item .cms-adventure-list-item-missingimage {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.25);
  transform-origin: center;
  fill: #ffffff52;
}

.cms-adventure-list-item .cms-adventure-list-item-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  position: absolute;
  left: 0;
  bottom: 0;
  width: calc(100% - 1.6rem + 1px);
  min-height: 2rem;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  background-color: #ffffff96;
  justify-content: space-between;
  padding: 0 0.8rem;
}

.cms-adventure-list-item .cms-adventure-list-item-title {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.cms-adventure-actions-container {
  direction: rtl;
  display: flex;
  flex-basis: 1.625rem;
  max-width: 4.9rem;
  overflow: hidden;
  background: #ffffff78;
  border-radius: 0.8rem;
  transition: flex-basis 0.3s ease;
}
.cms-adventure-actions-container[aria-expanded=true] {
  flex-basis: 5.4rem;
}

.cms-adventure-actions-container .cms-adventure-actions-button {
  width: 1.625rem;
  min-width: 1.625rem;
  height: 1.625rem;
  background-color: #ffffff78;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1px;
  transition: background-color 0.15s ease;
}

.cms-adventure-actions-container .cms-adventure-actions-button:hover {
  background-color: #ffffffb9;
}

.cms-adventure-actions-container .cms-adventure-actions-button svg {
  fill: #454545;
}
</style>