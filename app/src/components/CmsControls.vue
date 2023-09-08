<script>
import { ref, onMounted, nextTick } from "vue";
import { useCmsControlsStore } from "../stores/cmscontrols.js";
import { usePageContext } from "../../renderer/usePageContext.js";

import CmsButtonArrow from "./buttons/CmsButtonArrow.vue";
import CmsPopup from "./CmsPopup.vue";
import CmsPopupActionButtons from "./CmsPopupActionButtons.vue";
</script>

<script setup>
const props = defineProps({
  adventure: {
    type: Object,
    required: true
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
      cmsControlsMinimized = ref(false),
      publishPopupShowing = ref(false),
      publishedPageLink = ref(""),
      publishingStatus = ref({
        code: 0,
        text: "Idle",
        moreInfo: ""
      });

function onPublishClick() {
  publishPopupShowing.value = !publishPopupShowing.value;
}

async function doPublish() {
  publishingStatus.value.code = 1
  publishingStatus.value.text = "Publishing ...";
  publishingStatus.value.moreInfo = "";

  try {
    await cmsControlsStore.actionWithResult(cmsControlsStore.actions.PUBLISH);

    publishingStatus.value.code = 2;
    publishingStatus.value.text = "Success!";
  } catch (ex) {
    publishingStatus.value.code = 3;
    publishingStatus.value.text = "Error";
    publishingStatus.value.moreInfo = ex;
  }
}

function onMinimizeControlsClick() {
  cmsControlsMinimized.value = !cmsControlsMinimized.value;

  const cookieExpireDate = new Date();
  cookieExpireDate.setFullYear(cookieExpireDate.getFullYear() + 1);

  document.cookie = `${minimizedUserSettingsKey}=${cmsControlsMinimized.value}; Expires=${cookieExpireDate}; SameSite=Lax; Secure`;
}

function onBackClick() {
  window.location.href = window.location.href.replace(/\/[^\/]*$/, "/");
}

onMounted(async () => {
  cmsControlsHeight.value = `${cmsControls.value.clientHeight}px`;
  cmsControlsWidth.value = `${Math.ceil(cmsControls.value.getBoundingClientRect().width)}px`;

  await nextTick();

  if (minimizedStartValue.value) {
    cmsControlsMinimized.value = true;

    setTimeout(() => {
      minimizedStartValue.value = null;
    }, parseFloat(cmsControlsAnimTime) * 1000);
  }

  publishedPageLink.value = window.location.href.replace(/staging\//, "");
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

          <label for="input-full-scroll">Full scroll:</label>
          <input id="input-full-scroll" type="checkbox" class="cms-controls-toggle" :class="{ 'toggle-on': cmsControlsStore.fullScroll }" v-model="cmsControlsStore.fullScroll">
        </div>

        <div class="cms-controls-input centered">
          <button id="button-publish" class="cms-controls-button cms-button-publish" @click="onPublishClick">Publish ...</button>
        </div>

        <div class="cms-controls-input centered">
          <CmsButtonArrow class="cms-button-back" @click="onBackClick">Back to list</CmsButtonArrow>
        </div>
      </div>
    </Transition>
  </div>

  <CmsPopup class="publishing-popup" :popupShowing="publishPopupShowing" @keydown.prevent.escape="publishPopupShowing = false">
    <h2 class="publishing-popup-headline">Publishing</h2>
    <div class="publishing-popup-content">
      <div class="publishing-popup-info">
        <label for="published-page-link">Link:</label>
        <a :href="publishedPageLink" id="published-page-link">{{ publishedPageLink }}</a>

        <label for="published-date">Last published:</label>
        <!-- <span id="published-date">2023-09-06 10:54:00 GMT+2</span> -->
        <span id="published-date">{{ adventure.meta.publisheddate || "N/A" }}</span>
      </div>
      <div class="publishing-popup-process">
        <div class="publishing-status-text">
          <span>Status:</span>
          <span :class="{ 'idle': publishingStatus.code === 0, 'in-progress': publishingStatus.code === 1 }">{{ publishingStatus.text }}</span>
          <span v-if="publishingStatus.code === 1" class="spinner-sm"></span>
          <svg v-else-if="publishingStatus.code === 2" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 490" fill="#00d700"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>
          <svg v-else-if="publishingStatus.code === 3" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 450" fill="red"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
        </div>
        <div v-if="publishingStatus.moreInfo" class="publishing-status-moreinfo">
          {{ publishingStatus.moreInfo }}
        </div>
      </div>
    </div>
    <CmsPopupActionButtons okText="Publish" cancelText="Close" @confirm="doPublish" @cancel="publishPopupShowing = false" />
  </CmsPopup>
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  transition-property: gap, background-color;
  transition-timing-function: ease-out;
  transition-duration: v-bind(cmsControlsAnimTime);
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
  gap: 0.7rem;
}

.cms-controls label {
  white-space: nowrap;
}

.cms-controls .cms-controls-wrapper button {
  background-color: transparent;
  border-radius: 0.5rem;
  box-sizing: border-box;
  transition: background-color 0.15s ease-out;
}

.cms-controls .cms-controls-wrapper button:not(.cms-controls-title):hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.cms-controls .cms-controls-toggle {
  justify-self: end;
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
  align-items: center;
}

.cms-controls .cms-controls-input.centered {
  display: flex;
  justify-content: center;
}

.cms-controls .cms-button-publish {
  width: 100%;
  padding: 0.5rem 0;
}

.cms-controls .cms-button-back {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.publishing-popup .publishing-popup-headline {
  margin-bottom: 1rem;
}

.publishing-popup .publishing-popup-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  word-break: break-all;
}

.publishing-popup .publishing-popup-content .publishing-popup-info {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem;
}

.publishing-popup .publishing-popup-content .publishing-status-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 1.4em;
}

.publishing-popup .publishing-popup-content .publishing-status-text .idle {
  opacity: 0.5;
}

.publishing-popup .publishing-popup-content .publishing-status-text .in-progress {
  animation: in-progress 0.75s ease-in-out 0s infinite alternate;
}

.publishing-popup .publishing-popup-content .publishing-status-text .spinner-sm {
  display: inline-block;
}

.publishing-popup .publishing-popup-content .publishing-status-moreinfo {
  font-family: monospace;
  margin-left: 0.75rem;
  min-height: 1.4em;
}

.publishing-popup .publishing-popup-content .publishing-popup-process {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cms-controls .fade-enter-active,
.cms-controls .fade-leave-active {
  transition: opacity v-bind(cmsControlsAnimTime) ease-out;
}

.cms-controls .fade-enter-from,
.cms-controls .fade-leave-to {
  opacity: 0;
}

@keyframes in-progress {
  from { opacity: 0.6; transform: scale(0.975); }
  to { opacity: 1; transform: scale(1); }
}
</style>