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
      slideControlsExpanded = ref(false);

let slideControlsExpandedTimeout = 0;

function onSlideControlsMouseEnter() {
  clearTimeout(slideControlsExpandedTimeout)
}

function onSlideControlsMouseLeave() {
  slideControlsExpandedTimeout = setTimeout(() => slideControlsExpanded.value = false, 1000);
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
    content: {
      text: "",
      position: "bottom end"
    }
  });
}
/* /CMS */
</script>

<template>
  <component class="slide" :is="slideType" :slide="slide" :adventureMeta="adventureMeta" :showing="slideChange.current === slideIdx">
    <!-- CMS -->
    <template #cmsAddSlideContentButton>
      <div v-if="cmsControlsStore.editMode" class="cms-new-slide-content-outer">
        <CmsAdventureItemButtonNew class="cms-new-slide-content-button" @click="onNewSlideContentClick" />
      </div>
    </template>

    <template #cmsRemoveSlideButton>
      <div v-if="cmsControlsStore.editMode" class="slide-controls" :class="{ expanded: slideControlsExpanded }" @mouseenter="onSlideControlsMouseEnter" @mouseleave="onSlideControlsMouseLeave">
        <CmsOptionsButton v-if="!slideControlsExpanded" @click="slideControlsExpanded = true" />

        <template v-else>
          <CmsButtonDelete @click="onRemoveSlideClick" deleteWhatText="slide" />
          <CmsButtonClose @click="slideControlsExpanded = false"/>
        </template>        
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
  flex-direction: column;
  gap: 1rem;
  justify-content: space-evenly;
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
  height: 8rem;
}

.slide .slide-controls button {
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
/* /CMS */
</style>
