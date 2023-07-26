<script>
import { computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { isCmsView } from "../../../src/utils.js";
import { useI18nBundle } from "../../composables/i18nBundle.js";
import { useVI18nAttr } from "../../composables/vI18nAttr.js";

import AdventureEditableText from "../AdventureEditableText.vue";
import AdventureSwiperGallery from "../AdventureSwiperGallery.vue";

import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import PhotoSwipeDynamicCaption from "photoswipe-dynamic-caption-plugin";
import "photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css";
import "../../assets/photoswipe-dynamic-caption-plugin-custom.css";

/* CMS */
import { ref, h, render } from "vue";
import { useCmsControlsStore } from "../../stores/cmscontrols.js";
import { useConfirmationStore } from "../../stores/confirmation";
import CmsAdventureItemButtonNew from "../buttons/CmsAdventureItemButtonNew.vue";
import CmsOptionsButton from "../buttons/CmsOptionsButton.vue";
import CmsButtonClose from "../buttons/CmsButtonClose.vue";
import CmsButtonDelete from "../buttons/CmsButtonDelete.vue";
import CmsButtonPosition from "../buttons/CmsButtonPosition.vue";
import CmsButtonGalleryStyle from "../buttons/CmsButtonGalleryStyle.vue";
/* /CMS */
</script>

<script setup>
let pswpInstance;

const props = defineProps({
  slide: {
    type: Object,
    required: true
  }
});

const slideClass = computed(() => props.slide.content && props.slide.content.position && props.slide.content.position.split(" ").map(pos => `content-pos-${pos}`)) || null

const slideContentClass = computed(() => {
  const baseClass = {
    narrow: props.slide.gallery && props.slide.gallery.style === "grid"
  };
  baseClass[props.slide.content.position] = true;
  return baseClass;
});

const { t, locale } = useI18n(),
      { i18nBundle } = useI18nBundle(),
      { vI18nAttr } = useVI18nAttr();

function closeAllPhotoSwipes() {
  for (let slideId in window.photoSwipes) {
    let pswp = window.photoSwipes[slideId].pswp;

    if (pswp)
      pswp.close();
  }
}

function initGallery() {
  if (window.photoSwipes === undefined)
    window.photoSwipes = {};

  if (window.photoSwipes[props.slide.id])
    delete window.photoSwipes[props.slide.id];

  if (pswpInstance)
    pswpInstance.destroy();

  // Init photoswipe
  pswpInstance = new PhotoSwipeLightbox({
      gallery: `#slide_${props.slide.id}`,
      children: "a:not([external])",
      wheelToZoom: true,
      preload: [1, 1], // One before, one after - PhotSwipe minimum
      preloaderDelay: 500,
      closeTitle: t("misc.close"),
      zoomTitle: t("misc.zoom"),
      arrowPrevTitle: t("misc.previous"),
      arrowNextTitle: t("misc.next"),
      errorMsg: t("misc.error.imageunloadable"),
      pswpModule: () => import("photoswipe"),
  });

  pswpInstance.on("change", () => {
    // Scroll the thumbnail so that it's visible in its container
    pswpInstance.pswp.currSlide.data.element.scrollIntoView({behavior: "smooth", block: "nearest"});
  });

  pswpInstance.on("beforeOpen", () => {
    // Make sure scrolling doesn't trigger full page scroll's slide change
    window.fs.removeEvents();
  });

  pswpInstance.on("destroy", () => {
    // Re-enable full page scroll events
    if (window.fs.defaults.active)
      window.fs.addEvents();
  });

  pswpInstance.init();

  new PhotoSwipeDynamicCaption(pswpInstance, {
    type: "auto",
    captionContent: (pswpSlide) => {
      const slideElement = pswpSlide.data.element,
            img = pswpSlide.data.element.querySelector("img");

      if (img) {
        if (isCmsView)
          return img.dataset.caption;
        else
          return img.alt;
      } else {
        if (isCmsView)
          return slideElement.dataset.caption;
        else
          return slideElement.title;
      }
    }
  });

  /* CMS */
  initEditableCaptions();
  /* /CMS */  

  window.photoSwipes[props.slide.id] = pswpInstance;

  window.addEventListener("hashchange", closeAllPhotoSwipes);
}

watch(locale, initGallery);

onMounted(initGallery);

/* CMS */
const cmsControlsStore = useCmsControlsStore(),
      confirmationStore = useConfirmationStore(),
      slideControlsExpanded = ref(false),
      firstGalleryImgInput = ref(null),
      submenuExpanded = ref({
        position: false,
        galleryStyle: false
      });

let slideControlsExpandedTimeout = 0;

const positionButtonSelection = computed(() => {
  const pos = (props.slide.content && props.slide.content.position) || "center";

  return {
    topLeft: pos === "top start" || pos === "start top",
    topRight: pos === "top end" || pos === "end top",
    bottomLeft: pos === "bottom start" || pos === "start bottom",
    bottomRight: pos === "bottom end" || pos === "end bottom",
    center: pos === "center"
  }
});

const galleryStyleButtonSelection = computed(() => {
  const style = (props.slide.gallery && props.slide.gallery.style) || "row";

  return {
    grid: style === "grid",
    row: style === "row"
  }
});

function onChooseFirstGalleryImg(file) {
  cmsControlsStore.action(cmsControlsStore.actions.ADD_SLIDE_GALLERY_IMG, {
    slideId: props.slide.id,
    file: file
  });
}

function onSlideControlsMouseEnter() {
  clearTimeout(slideControlsExpandedTimeout)
}

function onSlideControlsMouseLeave() {
  slideControlsExpandedTimeout = setTimeout(() => slideControlsExpanded.value = false, 1000);
}

function onSlideContentDeleteClick() {
  confirmationStore.getConfirmation(
    "Remove slide content",
    `
      <p>Are you sure you want to remove content of slide <b style="white-space: nowrap;">${props.slide.id}</b>?</p>
      <p>This will also remove all gallery images and their captions.</p>
      <p style="color:red">THIS CANNOT BE UNDONE!</p>
    `,
    () => cmsControlsStore.action(cmsControlsStore.actions.DEL_SLIDE_CONTENT, { slideId : props.slide.id })
  )
}

function onChangePosition(newPos) {
  if (props.slide.content && props.slide.content.position === newPos) {
    submenuExpanded.value.position = false;
    return;
  }

  cmsControlsStore.actionWithResult(cmsControlsStore.actions.CHANGE_SLIDE_CONTENT_POSITION, { 
    slideId: props.slide.id,
    position: newPos
  }).then(() => {
    submenuExpanded.value.position = false;
  });
}

function onChangeGalleryStyle(newStyle) {
  if (props.slide.gallery && props.slide.gallery.style === newStyle) {
    submenuExpanded.value.galleryStyle = false;
    return;
  }
  
  cmsControlsStore.actionWithResult(cmsControlsStore.actions.CHANGE_SLIDE_GALLERY_STYLE, {
    slideId: props.slide.id,
    style: newStyle
  }).then(() => {
    submenuExpanded.value.galleryStyle = false;
  });
}

function initEditableCaptions() {
  pswpInstance.on("dynamicCaptionMeasureSize", ({ captionEl, captionSize }) => {
    const captionText = captionEl.querySelector(".text-wrapper");

    // In edit mode, set minimum width for caption so that text can be input easier
    if (cmsControlsStore.editMode && captionText && captionText.textContent === "")
      captionSize.x = 300;
  });
  pswpInstance.on("dynamicCaptionUpdateHTML", ({ captionElement, slide /* PSWP 'slide'! */ }) => {
    let captionTextModule = captionElement.innerHTML,
        captionExists = captionTextModule !== "none";

    const editableTextFocusAction = ref(),
          imgId = slide.data.element.dataset.id;

    captionElement.innerHTML = "";

    if (!captionExists) {
      if (cmsControlsStore.editMode)
        captionTextModule = `${imgId}_caption`;
      else
        captionTextModule = "";
    }

    render(
      h(
        AdventureEditableText,
        {
          i18n: i18nBundle.value,
          textModule: captionTextModule,
          onBlur: () => {
            pswpInstance.dispatch("bindEvents");
          },
          onSave: () => {
            if (captionExists)
              return;

            cmsControlsStore.actionWithResult(cmsControlsStore.actions.ADD_SLIDE_GALLERY_IMG_CAPTION, {
              slideId: props.slide.id,
              captionTextModule: captionTextModule,
              imageId: imgId
            }).then(() => captionExists = true);
          },
          focusAction: editableTextFocusAction,
          emptyPlaceholder: "Empty caption"
        }
      ),
      captionElement
    );

    captionElement.addEventListener("click", () => {
      if (!cmsControlsStore.editMode)
        return;

      const scrollWrapElement = pswpInstance.pswp.element.querySelector(".pswp__scroll-wrap");

      // Remove all events of PhotoSwipe that would prevent proper interaction with ProseMirror.
      // They can be later added again using pswp.dispatch('bindEvents')
      scrollWrapElement.removeEventListeners("click pointercancel pointerdown");
      document.removeEventListeners("focusin keydown");
      window.removeEventListeners("pointermove pointerup");

      editableTextFocusAction.value = Math.random();
    })
  });
}

watch(slideControlsExpanded, value => {
  if (value === false) {
    for (let submenuType in submenuExpanded.value)
      submenuExpanded.value[submenuType] = false;
  }
});
/* /CMS */
</script>

<template>
  <section
    :id="`slide_${slide.id}`"
    class="slide-gallery"
    :class="slideClass"
  >
    <a
      v-if="slide.mainImg.src"
      :href="slide.mainImg.src.original"
      :data-pswp-width="slide.mainImg.width"
      :data-pswp-height="slide.mainImg.height"
      :data-id="slide.mainImg.id"
      data-cropped="true"
      :data-caption="isCmsView ? (slide.mainImg.caption || 'none') : null"
      v-i18n-attr:[locale].title="slide.mainImg.caption"
      target="_blank"
      class="main-picture"
    ></a>

    <div v-if="slide.headline || slide.content" class="content-outer" :class="slideContentClass">
      <h2 class="headline">
        <AdventureEditableText :i18n="i18nBundle" :text-module="slide.headline" emptyPlaceholder="Empty headline" />
      </h2>

      <div class="content-inner">
        <AdventureEditableText :i18n="i18nBundle" :textModule="slide.content.text" :isMultiline="true" emptyPlaceholder="Empty content" />
  
        <AdventureSwiperGallery
          v-if="slide.gallery && slide.gallery.images && slide.gallery.images.length"
          :slideId="slide.id"
          :gallery="slide.gallery" />

        <!-- CMS -->
        <div v-else-if="cmsControlsStore.editMode" class="cms-new-gallery-outer">
          <CmsAdventureItemButtonNew class="cms-new-gallery-button" @click="firstGalleryImgInput.click()" size="small" />
          <input type="file" @change="onChooseFirstGalleryImg($event.target.files[0])" accept="image/jpeg,image/png,image/gif" ref="firstGalleryImgInput">
        </div>
        <!-- /CMS -->
      </div>

      <!-- CMS -->
      <div v-if="cmsControlsStore.editMode" class="slide-content-controls" :class="{ expanded: slideControlsExpanded }" @mouseenter="onSlideControlsMouseEnter" @mouseleave="onSlideControlsMouseLeave">
        <CmsOptionsButton v-if="!slideControlsExpanded" @click="slideControlsExpanded = true" />
        <CmsButtonClose v-else @click="slideControlsExpanded = false"/>

        <template v-if="slideControlsExpanded">
          <CmsButtonDelete @click="onSlideContentDeleteClick" deleteWhatText="slide content" />
          <Transition name="submenu-toggle-transition">
            <CmsButtonPosition v-if="!submenuExpanded.position" class="button-position" title="Change slide content position" :alignPos="(slide.content && slide.content.position) || 'center'" :selected="true" @click="submenuExpanded.position = true" />
          </Transition>
          <Transition name="submenu-transition">
            <div v-if="submenuExpanded.position" class="slide-content-controls-submenu submenu-start">
              <CmsButtonPosition class="submenu-item" title='Content position "top start"' alignPos="top start" :selected="positionButtonSelection.topLeft" @click="onChangePosition('top start')" />
              <CmsButtonPosition class="submenu-item" title='Content position "top end"' alignPos="top end" :selected="positionButtonSelection.topRight" @click="onChangePosition('top end')" />
              <CmsButtonPosition class="submenu-item" title='Content position "bottom start"' alignPos="bottom start" :selected="positionButtonSelection.bottomLeft" @click="onChangePosition('bottom start')" />
              <CmsButtonPosition class="submenu-item" title='Content position "bottom end"' alignPos="bottom end" :selected="positionButtonSelection.bottomRight" @click="onChangePosition('bottom end')" />
              <CmsButtonPosition class="submenu-item centered-in-grid" title='Content position "center"' alignPos="center" :selected="positionButtonSelection.center" @click="onChangePosition('center')" />
            </div>
          </Transition>
          <Transition name="submenu-toggle-transition">
            <CmsButtonGalleryStyle v-if="!submenuExpanded.galleryStyle" class="button-gallery-style" title="Change slide gallery type" :variant="(slide.gallery && slide.gallery.style) || 'row'" :selected="true" @click="submenuExpanded.galleryStyle = true" />
          </Transition>
          <Transition name="submenu-transition">
            <div v-if="submenuExpanded.galleryStyle" class="slide-content-controls-submenu submenu-end">
              <CmsButtonGalleryStyle class="submenu-item" title='Gallery style "row"' variant="row" :selected="galleryStyleButtonSelection.row" @click="onChangeGalleryStyle('row')" />
              <CmsButtonGalleryStyle class="submenu-item" title='Gallery style "grid"' variant="grid" :selected="galleryStyleButtonSelection.grid" @click="onChangeGalleryStyle('grid')" />
            </div>
          </Transition>
        </template>
      </div>
      <!-- /CMS -->
    </div>

    <slot v-else name="cmsAddSlideContentButton"></slot>

    <slot name="cmsSlideControls"></slot>
  </section>
</template>

<style>
.slide-gallery .content-outer {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  margin: 3rem 0;
  max-width: calc(100vw - 6rem);
  max-height: 75vh;
  padding: 2rem;
  border-radius: 24px;
  
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px) grayscale(0.5);
}

.slide-gallery .content-outer .headline {
  padding: 0 5px;
}

.slide-gallery .content-outer.top, .slide-gallery .content-outer.bottom, .slide-gallery .content-outer.start, .slide-gallery .content-outer.end {
  position: relative;
}

.slide-gallery .content-outer.top {
  align-self: flex-start;
}

.slide-gallery .content-outer.bottom {
  align-self: flex-end;
}

@media (min-width: 768px) {
  .slide-gallery .content-outer {
    max-width: 30rem;
    align-self: unset;
    margin: 0;
    padding: 3rem calc(3rem - 5px);
    border-radius: 48px;
  }

  .slide-gallery .content-outer.narrow {
    max-width: 15rem;
  }
  
  .slide-gallery .content-outer.top, .slide-gallery .content-outer.bottom, .slide-gallery .content-outer.start, .slide-gallery .content-outer.end {
    position: absolute;
  }

  .slide-gallery .content-outer.top {
    top: 3rem;
  }

  .slide-gallery .content-outer.bottom {
    bottom: 3rem;
  }

  .slide-gallery .content-outer.start {
    left: 3rem;
  }

  .slide-gallery .content-outer.end {
    right: 3rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .slide-gallery .content-outer {
    padding: 1.5rem;
    margin: 1rem 0;
    max-height: calc(100vh - 6rem);
    border-radius: 24px;
  }

  .slide-gallery .content-outer.narrow {
    max-width: 50vw;
  }

  .slide-gallery .content-outer.narrow p {
    margin: 0;
  }

  .slide-gallery .content-outer.top {
    top: 1rem;
  }

  .slide-gallery .content-outer.bottom {
    bottom: 0;
  }

  .slide-gallery .content-outer.start {
    left: 1rem;
  }

  .slide-gallery .content-outer.end {
    right: 2.8rem;
  }

  @media (max-width: 768px) {
    .slide-gallery .content-outer.start {
      left: 0;
    }

    .slide-gallery .content-outer.end {
      right: 0;
    }
  }
}

@media (orientation: portrait) and (max-width: 768px) {
  .slide-gallery .content-outer {
    padding: 1.5rem;
  }
}

.slide-gallery .content-outer .content-inner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 5px;
  overflow-y: auto;
}

.slide-gallery .content-outer .content-inner p {
  text-align: justify;
  hyphens: auto;
}

.slide-gallery .content-outer .content-inner p:first-child {
  margin-top: 3px;
}

.slide-gallery .content-outer .content-inner p:not(:first-child) {
  margin-top: 0.5em;
}

@media (orientation: landscape) and (max-height: 500px) {
  .slide-gallery .content-outer.narrow .content-inner {
    display: grid;
    grid-template-columns: 1fr auto;
    column-gap: calc(1.5rem - 10px);
  }

  .slide-gallery .content-outer.narrow .content-inner p {
    max-height: calc(2 * 6rem + 0.5rem);
    padding-right: 10px;
  }
}

/* CMS */
.slide .cms-new-gallery-outer .cms-new-gallery-button {
  background: rgba(0, 0, 0, 0.2);
  border: 2px dashed black;
  border-radius: 1rem;
  padding: 0.5rem 0;
  transition: background-color 0.1s ease;
}

.slide .cms-new-gallery-outer .cms-new-gallery-button:hover {
  background-color: #57575752;
}

.slide .cms-new-gallery-outer input[type=file] {
  position: absolute;
  visibility: hidden;
  width: 0;
  height: 0;
}

.slide .content-outer .slide-content-controls {
  display: grid;
  grid: repeat(2, 1fr) / repeat(3, 1fr);
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 3rem;
  height: 3rem;
  border-radius: 1.5rem;
  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(3px);
  overflow: hidden;
  transition-property: width, height, top, bottom, left, right;
  transition-duration: 0.15s;
  transition-timing-function: ease-out;
}

.slide .content-outer .slide-content-controls .button-options:focus-visible {
  outline-offset: -3px;
  outline: 2px solid white;
  border-radius: 1.5rem;
}

.slide .content-outer .slide-content-controls.expanded {
  width: 9rem;
  height: 6rem;
}

.slide .content-outer .slide-content-controls .button-options {
  width: 3rem;
  height: 3rem;
  grid-row: 2;
  grid-column: 2;
}

.slide .content-outer .slide-content-controls .button-close {
  grid-row: 2;
  grid-column: 2;
}

.slide .content-outer .slide-content-controls .button-delete {
  grid-row: 1;
  grid-column: 2;
}

.slide .content-outer .slide-content-controls .button-position {
  grid-row: 2;
  grid-column: 1;
  opacity: 1;
}

.submenu-toggle-transition-leave-active,
.submenu-toggle-transition-enter-active {
  transition: opacity 0.15s ease-out;
}

.slide .content-outer .slide-content-controls .button-position.submenu-toggle-transition-enter-from,
.slide .content-outer .slide-content-controls .button-position.submenu-toggle-transition-leave-to {
  opacity: 0;
}

.slide .content-outer .slide-content-controls .button-gallery-style {
  grid-row: 2;
  grid-column: 3;
}

.slide.content-pos-top .content-outer .slide-content-controls { bottom: -2rem; }
.slide.content-pos-top .content-outer .slide-content-controls.expanded { bottom: -5rem; }
.slide.content-pos-top .content-outer .slide-content-controls .button-close { grid-row: 1; }
.slide.content-pos-top .content-outer .slide-content-controls .button-delete { grid-row: 2; }
.slide.content-pos-top .content-outer .slide-content-controls .button-position { grid-row: 1; }
.slide.content-pos-top .content-outer .slide-content-controls .button-gallery-style { grid-row: 1; }
.slide.content-pos-center .content-outer .slide-content-controls,
.slide.content-pos-bottom .content-outer .slide-content-controls { top: -2rem; }
.slide.content-pos-center .content-outer .slide-content-controls.expanded,
.slide.content-pos-bottom .content-outer .slide-content-controls.expanded { top: -5rem; }
.slide.content-pos-center .content-outer .slide-content-controls,
.slide.content-pos-start .content-outer .slide-content-controls,
.slide.content-pos-end .content-outer .slide-content-controls { left: calc(50% - 1.5rem); }
.slide.content-pos-center .content-outer .slide-content-controls.expanded,
.slide.content-pos-start .content-outer .slide-content-controls.expanded,
.slide.content-pos-end .content-outer .slide-content-controls.expanded { left: calc(50% - 4.5rem); }

@media (min-width: 768px) { 
  .slide.content-pos-top .content-outer .slide-content-controls { bottom: -1rem; }
  .slide.content-pos-top .content-outer .slide-content-controls.expanded { bottom: -4rem; }
  .slide.content-pos-start .content-outer .slide-content-controls { right: -1rem; left: unset; }
  .slide.content-pos-start .content-outer .slide-content-controls.expanded { right: -4rem; left: unset; }
  .slide.content-pos-center .content-outer .slide-content-controls,
  .slide.content-pos-end .content-outer .slide-content-controls { left: -1rem; }
  .slide.content-pos-center .content-outer .slide-content-controls.expanded,
  .slide.content-pos-end .content-outer .slide-content-controls.expanded { left: -4rem; }
  .slide.content-pos-center .content-outer .slide-content-controls,
  .slide.content-pos-bottom .content-outer .slide-content-controls { top: -1rem; }
  .slide.content-pos-center .content-outer .slide-content-controls.expanded,
  .slide.content-pos-bottom .content-outer .slide-content-controls.expanded { top: -4rem; }
}

.slide .content-outer .slide-content-controls button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  border: none;
  background: none;
  color: white;
}

.slide .content-outer .slide-content-controls button svg {
  fill: white;
  transform: scale(1.4);
}

.slide .content-outer .slide-content-controls.expanded button svg {
  transform: scale(1.2);
}

.slide .content-outer .slide-content-controls.expanded .slide-content-controls-submenu {
  display: grid;
  align-items: center;
  justify-items: center;
  grid: 'grid-auto-rows' / 1fr 1fr;
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
  opacity: 1;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 1.5rem;
  z-index: 1;
}

.slide .content-outer .slide-content-controls.expanded .slide-content-controls-submenu.submenu-start {
  left: 0;
}

.slide .content-outer .slide-content-controls.expanded .slide-content-controls-submenu.submenu-end {
  right: 0;
}

.slide .content-outer .slide-content-controls.expanded .slide-content-controls-submenu.submenu-transition-enter-from,
.slide .content-outer .slide-content-controls.expanded .slide-content-controls-submenu.submenu-transition-leave-to {
  opacity: 0;
  width: 0;
  height: 0;
  bottom: 1.5rem;
}

.slide .content-outer .slide-content-controls.expanded .slide-content-controls-submenu.submenu-start.submenu-transition-enter-from,
.slide .content-outer .slide-content-controls.expanded .slide-content-controls-submenu.submenu-start.submenu-transition-leave-to {
  left: 1rem;
}

.slide .content-outer .slide-content-controls.expanded .slide-content-controls-submenu.submenu-end.submenu-transition-enter-from,
.slide .content-outer .slide-content-controls.expanded .slide-content-controls-submenu.submenu-end.submenu-transition-leave-to {
  right: 1rem;
}

.slide.content-pos-top .content-outer .slide-content-controls.expanded .slide-content-controls-submenu.submenu-transition-enter-from,
.slide.content-pos-top .content-outer .slide-content-controls.expanded .slide-content-controls-submenu.submenu-transition-leave-to {
  top: 1.5rem;
  bottom: unset;
}

.slide.content-pos-top .content-outer .slide-content-controls.expanded .slide-content-controls-submenu { 
  top: 0;
  bottom: unset;
}

.slide .content-outer .slide-content-controls.expanded .slide-content-controls-submenu .submenu-item {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  opacity: 1;
  transition-property: width, height, opacity;
  transition-timing-function: ease-out;
  transition-duration: .15s;
}

.slide .content-outer .slide-content-controls.expanded .slide-content-controls-submenu .submenu-item.centered-in-grid {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2.25rem;
  height: 2rem;
  transform: translate(-50%, -50%);
}

.submenu-transition-leave-active, 
.submenu-transition-enter-active {
  transition-property: width, height, top, bottom, left, right, opacity;
  transition-timing-function: ease-out;
  transition-duration: .15s;
}

.slide .content-outer .slide-content-controls.expanded .slide-content-controls-submenu.submenu-transition-enter-from .submenu-item,
.slide .content-outer .slide-content-controls.expanded .slide-content-controls-submenu.submenu-transition-leave-to .submenu-item {
  width: 0;
  height: 0;
  opacity: 0;
}
/* /CMS */
</style>
