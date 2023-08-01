<script>
import { ref, onMounted, nextTick } from "vue";
import { useCmsControlsStore } from "../stores/cmscontrols.js";
import { usePageContext } from "../../renderer/usePageContext.js";
</script>

<script setup>
const props = defineProps({
  slides: {
    type: Array,
    required: false
  }
});

const { userSettings } = usePageContext(),
      minimizedUserSettingsKey = "CmsControls-minimized",
      minimizedStartValue = ref((() => {
        if (userSettings && typeof userSettings.minimized !== "undefined")
          return userSettings.minimized === "true";
        else
          return false;
      })()),
      cmsControlsAnimTime = "0.15s",
      cmsControlsStore = useCmsControlsStore(),
      cmsControls = ref(null),
      cmsControlsHeight = ref("initial"),
      cmsControlsWidth = ref("initial"),
      cmsControlsMinimized = ref(false);

function publish() {
  console.log("publishing ...")
  cmsControlsStore.action(cmsControlsStore.actions.PUBLISH);
}

function onMinimizeControlsClick() {
  cmsControlsMinimized.value = !cmsControlsMinimized.value;

  const cookieExpireDate = new Date();
  cookieExpireDate.setFullYear(cookieExpireDate.getFullYear() + 1);

  document.cookie = `${minimizedUserSettingsKey}=${cmsControlsMinimized.value}; Expires=${cookieExpireDate}; SameSite=Lax; Secure`;
}

onMounted(async () => {
  cmsControlsHeight.value = `${cmsControls.value.clientHeight}px`;
  cmsControlsWidth.value = `${cmsControls.value.clientWidth}px`;

  await nextTick();

  if (minimizedStartValue.value) {
    cmsControlsMinimized.value = true;

    setTimeout(() => {
      minimizedStartValue.value = null;
    }, parseFloat(cmsControlsAnimTime) * 1000);
  }
});
</script>

<template>
<div id="cms-controls" class="cms-controls" :class="{ minimized: cmsControlsMinimized }" ref="cmsControls" :aria-expanded="!cmsControlsMinimized" :style="{ opacity: minimizedStartValue ? 0 : null }">
  <div class="cms-controls-wrapper">
    <button class="cms-controls-title" @click="onMinimizeControlsClick" aria-controls="cms-controls">
      CMS controls
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
        <path d="M4,9 L9,4 L14,9" fill="none" stroke-width="2"></path>
        <path d="M4,15 L9,10 L14,15" fill="none" stroke-width="2"></path>
      </svg>
    </button>
    <Transition name="fade">
      <div v-if="!cmsControlsMinimized" class="cms-controls-content">
        <div class="cms-controls-grid">
          <label for="input-edit-mode">Edit mode:</label>
          <input id="input-edit-mode" type="checkbox" class="cms-controls-toggle" :class="{ 'toggle-on': cmsControlsStore.editMode }" v-model="cmsControlsStore.editMode">
          <label for="input-edit-mode">Full scroll:</label>
          <input id="input-edit-mode" type="checkbox" class="cms-controls-toggle" :class="{ 'toggle-on': cmsControlsStore.fullScroll }" v-model="cmsControlsStore.fullScroll">
        </div>

        <div class="cms-controls-input centered">
          <button class="cms-button-publish" @click="publish">Publish</button>
        </div>
      </div>
    </Transition>
  </div>
</div>
</template>

<style>
.cms-controls {
  max-height: v-bind(cmsControlsHeight);
  max-width: v-bind(cmsControlsWidth);
  overflow: hidden;
  z-index: 100;
  position: fixed;
  left: 1rem;
  top: 1rem;
  color: white;
  border-radius: 1.5rem;
  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(4px);
  transition: all v-bind(cmsControlsAnimTime) ease-out;
}

.cms-controls.minimized {
  max-height: 2rem;
  max-width: 8rem;
  left: 2px;
  top: 2px;
  font-size: 67%;
  border-radius: 1rem;
}

.cms-controls .cms-controls-wrapper {
  padding: 1.5rem;
  transition: padding v-bind(cmsControlsAnimTime) ease-out;
}

.cms-controls.minimized .cms-controls-wrapper {
  padding: 0.45rem 0.75rem;
}

.cms-controls .cms-controls-title {
  font-size: 120%;
  display: flex;
  gap: 1rem;
  align-items: center;
  background: none;
  border: none;
  padding: 0;
  white-space: nowrap;
  transition: gap v-bind(cmsControlsAnimTime) ease-out;
}

.cms-controls.minimized .cms-controls-title {
  gap: 0.5rem;
}

.cms-controls .cms-controls-title svg {
  width: 1.25rem;
  stroke: #ffffffd1;
  transition: all 0.05s ease-out;
}

.cms-controls.minimized .cms-controls-title svg {
  width: 1rem;
  transform: rotate(180deg);
}

.cms-controls .cms-controls-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.cms-controls .cms-controls-toggle {
  position: relative;
  margin: 0;
  width: 2.5rem;
  height: 1.25rem;
  cursor: pointer;
}

.cms-controls .cms-controls-toggle:before {
  content: "";
  display: inline-block;
  width: 2.5rem;
  height: 1.25rem;
  border-radius: 0.5rem;
  background-color: rgb(102, 102, 102);
  transition: background-color 0.15s ease-out;
}

.cms-controls .cms-controls-toggle:hover::before {
  background: rgb(137 137 137);
}

.cms-controls .cms-controls-toggle.toggle-on:before {
  background-color: rgb(0, 130, 216);
}

.cms-controls .cms-controls-toggle.toggle-on:hover::before {
  background: rgb(33 156 238);
}

.cms-controls .cms-controls-toggle:after {
  content: "";
  position: absolute;
  left: 2px;
  top: 0.1rem;
  background: white;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  transition-property: left;
  transition-duration: 0.15s;
  transition-timing-function: ease-out;
}

.cms-controls .cms-controls-toggle.toggle-on:after {
  left: calc(1.5rem - 2px);
}

.cms-controls .cms-controls-grid {
  display: grid;
  grid-template-columns: auto auto;
  gap: 0.5rem;
  justify-content: space-between;
}

.cms-controls .cms-controls-input.centered {
  display: flex;
  justify-content: center;
}

.cms-controls .cms-button-publish {
  padding: 0.5rem 1rem;
  background: transparent;
  border-radius: 0.5rem;
}

.cms-controls .fade-enter-active,
.cms-controls .fade-leave-active {
  transition: opacity v-bind(cmsControlsAnimTime) ease-out;
}

.cms-controls .fade-enter-from,
.cms-controls .fade-leave-to {
  opacity: 0;
}
</style>