<script>
import { computed } from "vue";

import AdventureGallerySlide from "./adventure-slides/AdventureGallerySlide.vue";
import AdventureIntroSlide from "./adventure-slides/AdventureIntroSlide.vue";

function getCssUrlString(url) {
  return `url(${url})`;
}
</script>

<script setup>
const props = defineProps({
  author: {
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

const mainImgUrlXs = computed(() => getCssUrlString(props.slide.mainImg.xs));
const mainImgUrlSm = computed(() => getCssUrlString(props.slide.mainImg.sm));
const mainImgUrlMd = computed(() => getCssUrlString(props.slide.mainImg.md));
const mainImgUrlLg = computed(() => getCssUrlString(props.slide.mainImg.lg));
const mainImgUrlXl = computed(() => getCssUrlString(props.slide.mainImg.xl));
const mainImgUrlXxl = computed(() => getCssUrlString(props.slide.mainImg.xxl));
const mainImgUrlXxxl = computed(() => getCssUrlString(props.slide.mainImg.xxxl));
const mainImgUrlXxxxl = computed(() => getCssUrlString(props.slide.mainImg.xxxxl));

const slideType = computed(() => {
  if (props.slide.intro)
    return AdventureIntroSlide
  else
    return AdventureGallerySlide
});
</script>

<template>
  <component :is="slideType" :slide="slide" :author="author" :showing="slideChange.current === slideIdx" />
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
</style>
