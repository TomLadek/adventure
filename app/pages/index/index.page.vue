<script>
import { ref } from "vue";
import CmsNewAdventurePopup from "../../src/components/CmsNewAdventurePopup.vue"
import CmsAdventureItemButtonNew from "../../src/components/CmsAdventureItemButtonNew.vue";

// SSR
import { usePageContext } from "../../renderer/usePageContext.js";
</script>

<script setup>
const pageContext = usePageContext(),
      adventures = ref(pageContext.pageProps.adventureList),
      newAdventurePopupShowing = ref(false);

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
</script>

<template>
  <main id="index">
    <h1 class="cms-adventures-hdl">Adventures</h1>
    <ul class="cms-adventure-list">
      <li class="cms-adventure-list-item" v-for="adventure in adventures" :key="adventure.id">
        <a :href="adventure.meta.basePath" class="cms-adventure-link" :data-adventure-id="adventure.id">{{ Object.values(adventure.messages)[0][adventure.meta.title] }}</a>
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
  border-radius: 10px;
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

.cms-adventure-link {
  display: inline-block;
  width: 100%;
  height: 100%;
}
</style>