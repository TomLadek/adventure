<script>
import { ref, computed } from "vue";

import AdventureGallerySlide from "./adventure-slides/AdventureGallerySlide.vue";
import AdventureIntroSlide from "./adventure-slides/AdventureIntroSlide.vue";

/* CMS */
import { useConfirmationStore } from "../stores/confirmation.js";
import { useCmsControlsStore } from "../stores/cmscontrols";
import CmsAdventureItemButtonNew from "./buttons/CmsAdventureItemButtonNew.vue";
import CmsOptionsButton from "./buttons/CmsOptionsButton.vue";
import CmsButtonClose from "./buttons/CmsButtonClose.vue";
import CmsButtonDelete from "./buttons/CmsButtonDelete.vue";
/* /CMS */

function getCssUrlString(url) {
  return `url(${url})`;
}
</script>

<script setup>
const props = defineProps({
  adventureMeta: {
    type: Object,
    required: false
  },
  slide: {
    type: Object,
    required: true,
  },
  slideIdx: {
    type: Number,
    required: true
  },
  slideChange: {
    last: {
      type: Number
    },
    current: {
      type: Number
    },
    duration: {
      type: Number
    }
  }
});

const mainImgUrlXs = computed(() => getCssUrlString(props.slide.mainImg.src.xs));
const mainImgUrlSm = computed(() => getCssUrlString(props.slide.mainImg.src.sm));
const mainImgUrlMd = computed(() => getCssUrlString(props.slide.mainImg.src.md));
const mainImgUrlLg = computed(() => getCssUrlString(props.slide.mainImg.src.lg));
const mainImgUrlXl = computed(() => getCssUrlString(props.slide.mainImg.src.xl));
const mainImgUrlXxl = computed(() => getCssUrlString(props.slide.mainImg.src.xxl));
const mainImgUrlXxxl = computed(() => getCssUrlString(props.slide.mainImg.src.xxxl));
const mainImgUrlXxxxl = computed(() => getCssUrlString(props.slide.mainImg.src.xxxxl));

const slideType = computed(() => {
  if (props.slide.intro)
    return AdventureIntroSlide
  else
    return AdventureGallerySlide
});

/* CMS */
const confirmationStore = useConfirmationStore(),
      cmsControlsStore = useCmsControlsStore(),
      slideControlsExpanded = ref(false),
      submenuExpanded = ref({
        type: false,
        theme: false
      });;

let slideControlsExpandedTimeout = 0;

function onSlideControlsMouseEnter() {
  clearTimeout(slideControlsExpandedTimeout)
}

function onSlideControlsMouseLeave() {
  slideControlsExpandedTimeout = setTimeout(onSlideControlsCloseClick, 1000);
}

function onRemoveSlideClick() {
  confirmationStore.getConfirmation(
    `Remove slide`,
    `
      <p>Are you sure you want to remove slide <b style="white-space: nowrap;">${props.slide.id}</b>?</p>
      <p>This will also remove any contents of that slide including all gallery images, text, etc.</p>
      <p style="color:red">THIS CANNOT BE UNDONE!</p>
    `,
    () => cmsControlsStore.action(cmsControlsStore.actions.REMOVE_SLIDE, props.slide.id)
  );
}

function onNewSlideContentClick() {
  cmsControlsStore.action(cmsControlsStore.actions.ADD_SLIDE_CONTENT, {
    slideId: props.slide.id,
    headline: "",
    subheadline: "",
    content: {
      text: "",
      position: "bottom end"
    }
  });
}

async function onSlideTypeClick(type) {
  await cmsControlsStore.actionWithResult(cmsControlsStore.actions.CHANGE_SLIDE_PROPS, { slideId: props.slide.id, props: { intro: type === "intro" } });

  submenuExpanded.value.type = false;
}

async function onSlideThemeClick(theme) {
  await cmsControlsStore.actionWithResult(cmsControlsStore.actions.CHANGE_SLIDE_PROPS, { slideId: props.slide.id, props: { theme } });

  submenuExpanded.value.theme = false;
}

function onSlideControlsCloseClick() {
  for (const submenu of Object.keys(submenuExpanded.value)) {
    submenuExpanded.value[submenu] = false;
  }

  slideControlsExpanded.value = false;
}

function onSubmenuExpandClick(submenu) {
  for (const submn in submenuExpanded.value) {
    submenuExpanded.value[submn] = submn === submenu;
  }
}
/* /CMS */
</script>

<template>
  <component class="slide" :class="`slide-theme-${slide.theme || 'light'}`" :is="slideType" :slide="slide" :adventureMeta="adventureMeta" :showing="slideChange.current === slideIdx">
    <!-- CMS -->
    <template #cmsAddSlideContentButton>
      <div v-if="cmsControlsStore.editMode" class="cms-new-slide-content-outer">
        <CmsAdventureItemButtonNew class="cms-new-slide-content-button" @click="onNewSlideContentClick" />
      </div>
    </template>

    <template #cmsSlideControls>
      <div v-if="cmsControlsStore.editMode" class="slide-controls" :class="{ expanded: slideControlsExpanded }" @mouseenter="onSlideControlsMouseEnter" @mouseleave="onSlideControlsMouseLeave">
        <CmsOptionsButton v-if="!slideControlsExpanded" @click="slideControlsExpanded = true" />

        <Transition name="slide-controls-actions">
          <div v-if="slideControlsExpanded" class="slide-controls-actions">
            <button class="button-theme" title="Change slide theme" @click="onSubmenuExpandClick('theme')">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1024 1024">
                <path d="M898.56 189.44c-30.72-28.16-76.8-28.16-107.52 0l-440.32 435.2c-53.76 0-128 17.92-161.28 122.88-25.6 56.32-89.6 53.76-89.6 53.76 135.68 148.48 291.84 64 330.24 28.16 30.72-33.28 35.84-71.68 33.28-102.4l435.2-430.08c30.72-30.72 30.72-76.8 0-107.52zM396.8 793.6c-25.6 23.04-138.24 74.24-204.8 25.6 0 0 23.04-17.92 40.96-53.76 40.96-110.08 145.92-94.72 145.92-94.72l35.84 35.84c0-2.56 25.6 46.08-17.92 87.04z m53.76-125.44l-35.84-35.84 53.76-53.76 35.84 35.84-53.76 53.76z m412.16-407.04L537.6 581.12l-35.84-35.84L826.88 225.28c10.24-10.24 25.6-10.24 35.84 0 10.24 10.24 10.24 25.6 0 35.84z"/>
              </svg>
            </button>
            <Transition name="slide-controls-submenu-transition">
              <ul v-if="submenuExpanded.theme" class="slide-controls-submenu slide-theme-list">
                <li>
                  <button class="submenu-item theme-item" :class="{ active: !slide.theme || slide.theme === 'light' }" @click="onSlideThemeClick('light')">
                    <svg xmlns="http://www.w3.org/2000/svg" view-box="0 0 34 34" fill="white" width="34" height="34">
                      <circle cx="17" cy="17" r="8" stroke="white" stroke-width="1"></circle>
                    </svg>
                  </button>
                </li>
                <li>
                  <button class="submenu-item theme-item dark" :class="{ active: slide.theme === 'dark' }" @click="onSlideThemeClick('dark')">
                    <svg xmlns="http://www.w3.org/2000/svg" view-box="0 0 34 34" fill="black" width="34" height="34">
                      <circle cx="17" cy="17" r="8" stroke="white" stroke-width="1"></circle>
                    </svg>
                  </button>
                </li>
              </ul>
            </Transition>

            <button class="button-type" title="Change slide type" @click="onSubmenuExpandClick('type')">T</button>
            <Transition name="slide-controls-submenu-transition">
              <ul v-if="submenuExpanded.type" class="slide-controls-submenu slide-type-list">
                <li>
                  <button class="submenu-item type-item" :class="{ active: slide.intro }" @click="onSlideTypeClick('intro')">Intro slide</button>
                </li>
                <li>
                  <button class="submenu-item type-item" :class="{ active: !slide.intro }" @click="onSlideTypeClick('gallery')">Gallery slide</button>
                </li>
              </ul>
            </Transition>

            <CmsButtonDelete @click="onRemoveSlideClick" deleteWhatText="slide" />

            <CmsButtonClose @click="onSlideControlsCloseClick" />
          </div>
        </Transition>
      </div>
    </template>
    <!-- /CMS -->
  </component>
</template>

<style>
/* Common styles for all slides */
.slide {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: calc(100 * var(--vh));
  background-size: cover;
  background-position: center center;
}

@media (max-resolution: 149dpi) {
  @media (orientation: landscape) and (max-width: 575px) {
    .slide { background-image: v-bind(mainImgUrlXs); }
  }
  @media (orientation: landscape) and (min-width: 576px) {
    .slide { background-image: v-bind(mainImgUrlSm); }
  }
  @media (orientation: landscape) and (min-width: 768px) {
    .slide { background-image: v-bind(mainImgUrlMd); }
  }
  @media (orientation: landscape) and (min-width: 992px) {
    .slide { background-image: v-bind(mainImgUrlLg); }
  }
  @media (orientation: landscape) and (min-width: 1200px) {
    .slide { background-image: v-bind(mainImgUrlXl); }
  }
  @media (orientation: landscape) and (min-width: 1400px) {
    .slide { background-image: v-bind(mainImgUrlXxl); }
  }
  @media (orientation: landscape) and (min-width: 1600px) {
    .slide { background-image: v-bind(mainImgUrlXxxl); }
  }
  @media (orientation: landscape) and (min-width: 1920px) {
    .slide { background-image: v-bind(mainImgUrlXxxxl); }
  }

  @media (orientation: portrait) and (max-height: 575px) {
    .slide { background-image: v-bind(mainImgUrlXs); }
  }
  @media (orientation: portrait) and (min-height: 576px) {
    .slide { background-image: v-bind(mainImgUrlSm); }
  }
  @media (orientation: portrait) and (min-height: 744px) {
    .slide { background-image: v-bind(mainImgUrlMd); }
  }
  @media (orientation: portrait) and (min-height: 900px) {
    .slide { background-image: v-bind(mainImgUrlXl); }
  }
  @media (orientation: portrait) and (min-height: 1050px) {
    .slide { background-image: v-bind(mainImgUrlXxl); }
  }
  @media (orientation: portrait) and (min-height: 1200px) {
    .slide { background-image: v-bind(mainImgUrlXxxl); }
  }
  @media (orientation: portrait) and (min-height: 1440px) {
    .slide { background-image: v-bind(mainImgUrlXxxxl); }
  }
}

@media (min-resolution: 150dpi) {
  @media (orientation: landscape) and (max-width: 575px) {
    .slide { background-image: v-bind(mainImgUrlMd); }
  }
  @media (orientation: landscape) and (min-width: 576px) {
    .slide { background-image: v-bind(mainImgUrlLg); }
  }
  @media (orientation: landscape) and (min-width: 768px) {
    .slide { background-image: v-bind(mainImgUrlXl); }
  }
  @media (orientation: landscape) and (min-width: 992px) {
    .slide { background-image: v-bind(mainImgUrlXxxl); }
  }
  @media (orientation: landscape) and (min-width: 1200px) {
    .slide { background-image: v-bind(mainImgUrlXxxxl); }
  }

  @media (orientation: portrait) and (max-height: 287px) {
    .slide { background-image: v-bind(mainImgUrlXs); }
  }
  @media (orientation: portrait) and (min-height: 288px) {
    .slide { background-image: v-bind(mainImgUrlSm); }
  }
  @media (orientation: portrait) and (min-height: 372px) {
    .slide { background-image: v-bind(mainImgUrlMd); }
  }
  @media (orientation: portrait) and (min-height: 450px) {
    .slide { background-image: v-bind(mainImgUrlXl); }
  }
  @media (orientation: portrait) and (min-height: 525px) {
    .slide { background-image: v-bind(mainImgUrlXxl); }
  }
  @media (orientation: portrait) and (min-height: 600px) {
    .slide { background-image: v-bind(mainImgUrlXxxl); }
  }
  @media (orientation: portrait) and (min-height: 825px) {
    .slide { background-image: v-bind(mainImgUrlXxxxl); }
  }
}

.slide.slide-theme-light {
  color: var(--color-white);
}

.slide.slide-theme-dark {
  color: var(--color-black);
}

.slide .main-picture {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

/* CMS */
.slide .cms-new-slide-content-outer {
  position: absolute;
  bottom: 3rem;
}

@media (min-width: 768px) {
  .slide .cms-new-slide-content-outer {
    right: 3rem;  
  }
}

.slide .cms-new-slide-content-outer .cms-new-slide-content-button {
  width: min(32rem, 80vw);
  height: min(20rem, 80vh);
  border: 2px dashed grey;
  border-radius: 2rem;
  background-color: #a8a8a862;
  transition: background-color 0.1s ease;
}

.slide .cms-new-slide-content-outer .cms-new-slide-content-button:hover {
  background-color: #a8a8a899;
}

.slide .slide-controls {
  position: absolute;
  bottom: 1.5rem;
  right: 0;
  width: 3rem;
  height: 5rem;
  display: flex;
  justify-content: center;
  border-top-left-radius: 1rem;
  border-bottom-left-radius: 1rem;
  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(3px);
  transition: height 0.15s ease-out;
}

@media (min-width: 768px) {
  .slide .slide-controls {
    bottom: 0;
    border-bottom-left-radius: initial;
  }  
}

.slide .slide-controls.expanded {
  height: 14rem;
}

.slide .slide-controls .slide-controls-actions {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.slide .slide-controls .slide-controls-actions-enter-active,
.slide .slide-controls .slide-controls-actions-leave-active {
  position: absolute;
  overflow: hidden;
  transition: opacity 0.15s ease;
}

.slide .slide-controls .slide-controls-actions-enter-from,
.slide .slide-controls .slide-controls-actions-leave-to {
  opacity: 0;
}

.slide .slide-controls button {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  border: none;
  background: none;
  color: white;
}

.slide .slide-controls button svg {
  fill: white;
  transform: scale(1.4);
}

.slide .slide-controls .button-type {
  font-size: 200%;
  font-family: serif;
}

.slide .slide-controls .slide-controls-submenu {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(3px);
  border-radius: 0.5rem;
}

.slide-controls-submenu-transition-leave-active,
.slide-controls-submenu-transition-enter-active {
  transition-duration: 0.15s;
  transition-timing-function: ease-out;
  transition-property: opacity transform;
}

.slide .slide-controls .slide-controls-submenu-transition-enter-from,
.slide .slide-controls .slide-controls-submenu-transition-leave-to {
  opacity: 0;
  transform: scale(0.9) translateX(0.25rem);
}

.slide .slide-controls .slide-controls-submenu {
  width: max-content;
  list-style: none;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.slide .slide-controls .slide-controls-submenu.slide-type-list {
  right: 1rem;
  top: 1.5rem;
}

.slide .slide-controls .slide-controls-submenu.slide-type-list .type-item {
  width: 100%;
  padding: 0.6rem 1.2rem;
  font-size: 100%;
}

.slide .slide-controls .slide-controls-submenu .submenu-item {
  border-radius: 0.5rem;
}

.slide .slide-controls .slide-controls-submenu .submenu-item:hover {
  background: #ffffff38;
}

.slide .slide-controls .slide-controls-submenu .submenu-item.active {
  background: #ffffff69;
}

.slide .slide-controls .slide-controls-submenu .submenu-item.active:hover {
  background: #ffffff80;
}

.slide .slide-controls .slide-controls-submenu.slide-theme-list {
  right: 0.5rem;
  top: -0.5rem;
  flex-direction: row;
}

.slide .slide-controls .slide-controls-submenu.slide-theme-list .theme-item {
  width: 3rem;
  height: 3rem;
}

.slide .slide-controls .slide-controls-submenu.slide-theme-list .theme-item.dark svg {
  fill: black;
}

/* /CMS */
</style>
