<script>
import { ref } from "vue";
import CmsNewAdventurePopup from "../../src/components/CmsNewAdventurePopup.vue"
</script>

<script setup>
const newAdventurePopupShowing = ref(false)
let testAdventures = new Array(5)
</script>

<template>
  <main class="index">
    <h1 class="cms-adventures-hdl">Adventures</h1>
    <ul class="cms-adventure-list">
      <li class="cms-adventure-list-item" v-for="(_) in testAdventures">
        <a href="/2023-myadventure" class="cms-adventure-link">Adventure</a>
      </li>
      <li class="cms-adventure-list-item new-item">
        <button class="cms-adventure-item-button-new" @click="newAdventurePopupShowing = true">
          <svg width="32px" height="32px" class="new-item-icon">
            <rect x="13" y="0" rx="2" ry="2" width="6" height="32" fill="#CCCCCC"/>
            <rect x="0" y="13" rx="2" ry="2" width="32" height="6" fill="#CCCCCC"/>
          </svg>
        </button>
      </li>
    </ul>
  </main>

  <Transition name="popup-fade">
      <CmsNewAdventurePopup v-if="newAdventurePopupShowing" @closing="newAdventurePopupShowing = false"></CmsNewAdventurePopup>
    </Transition>
</template>

<style>
:root {
  --adventure-list-item-width: 20rem;
  --adventure-list-item-height: 11.25rem;
}

main.index {
  color: initial;
  padding: 3rem;
  position: relative;
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

.cms-adventure-item-button-new {
  width: 100%;
  height: 100%;
  background: none;
  padding: 0;
  border: none;
  cursor: pointer;
}

.new-item-icon {
  border: 1px solid #CCCCCC;
  border-radius: 50%;
  padding: 10px;
}

.cms-adventure-link {
  display: inline-block;
  width: 100%;
  height: 100%;
}

.popup-fade-enter-active, .popup-fade-leave-active {
  transition: all 0.2s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}
</style>