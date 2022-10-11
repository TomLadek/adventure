<script>
import { onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";

import AdventureSlideGallery from "./AdventureSlideGallery.vue";

import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import PhotoSwipeDynamicCaption from "photoswipe-dynamic-caption-plugin";
import "photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css";
import "../assets/photoswipe-dynamic-caption-plugin-custom.css";

function getCssUrlString(url) {
  return `url(${url})`;
}
</script>

<script setup>
let pswpInstance;

const props = defineProps({
  slide: {
    type: Object,
    required: true,
  },
  slideIdx: {
    type: Number,
    required: true,
  },
});

const mainImgUrlXs = computed(() => getCssUrlString(props.slide.mainImg.xs));
const mainImgUrlSm = computed(() => getCssUrlString(props.slide.mainImg.sm));
const mainImgUrlMd = computed(() => getCssUrlString(props.slide.mainImg.md));
const mainImgUrlLg = computed(() => getCssUrlString(props.slide.mainImg.lg));
const mainImgUrlXl = computed(() => getCssUrlString(props.slide.mainImg.xl));
const mainImgUrlXxl = computed(() => getCssUrlString(props.slide.mainImg.xxl));
const mainImgUrlXxxl = computed(() => getCssUrlString(props.slide.mainImg.xxxl));
const mainImgUrlXxxxl = computed(() => getCssUrlString(props.slide.mainImg.xxxxl));

const slideContentClass = computed(() => {
  const baseClass = {
    narrow: props.slide.gallery && props.slide.gallery.style === "grid"
  };
  baseClass[props.slide.content.position] = true;
  return baseClass;
});

const { t, locale } = useI18n();

function initGallery() {
  if (pswpInstance)
    pswpInstance.destroy();

  // Init photoswipe
  pswpInstance = new PhotoSwipeLightbox({
      gallery: "#" + props.slide.id,
      children: "a",
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
    window.fs.addEvents();
  });

  pswpInstance.init();

  new PhotoSwipeDynamicCaption(pswpInstance, {
    type: "auto",
    captionContent: (slide) => {
      const img = slide.data.element.querySelector("img");

      if (img)
        return img.getAttribute("alt");

      return slide.data.element.title;
    }
  });
}

watch(locale, async () => { initGallery() });
onMounted(initGallery);
</script>

<template>
  <section
    :id="slide.id"
    class="slide"
  >
    <a
      v-if="slide.mainImg"
      :href="slide.mainImg.original"
      v-bind="slide.mainImgAttrs"
      :title="slide.mainImgTitle && t(slide.mainImgTitle)"
      target="_blank"
      class="main-picture"
    ></a>

    <div class="slide-content-outer" :class="slideContentClass">
      <h2>{{ t(slide.headline) }}</h2>

      <div class="slide-content-inner">
        <div class="slide-text-wrapper">
          <p v-html="t(slide.content.text)"></p>
        </div>
  
        <AdventureSlideGallery v-if="slide.gallery" :gallery="slide.gallery" />
      </div>
    </div>
  </section>
</template>

<style>
.slide {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 100%;
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

  @media (orientation: portrait) and (max-height: 432px) {
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

  @media (orientation: portrait) and (max-height: 216px) {
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

.main-picture {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.slide-content-outer p {
  text-align: justify;
  hyphens: auto;
}

.slide-content-outer {
  display: flex;
  flex-direction: column;

  margin: 3rem 0;
  max-width: 75vw;
  max-height: 75vh;
  padding: 2rem;
  border-radius: 24px;
  
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px) grayscale(0.5);
}

.slide-content-outer.top, .slide-content-outer.bottom, .slide-content-outer.start, .slide-content-outer.end {
  position: relative;
}

.slide-content-outer.top {
  align-self: flex-start;
}

.slide-content-outer.bottom {
  align-self: flex-end;
}

@media (min-width: 768px) {
  .slide-content-outer {
    max-width: 30rem;
    align-self: unset;
    margin: 0;
    padding: 3rem;
    border-radius: 48px;
  }

  .slide-content-outer.narrow {
    max-width: 15rem;
  }
  
  .slide-content-outer.top, .slide-content-outer.bottom, .slide-content-outer.start, .slide-content-outer.end {
    position: absolute;
  }

  .slide-content-outer.top {
    top: 3rem;
  }

  .slide-content-outer.bottom {
    bottom: 3rem;
  }

  .slide-content-outer.start {
    left: 3rem;
  }

  .slide-content-outer.end {
    right: 3rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .slide-content-outer {
    padding: 1.5rem;
    margin: 1rem 0;
    max-height: calc(100vh - 6rem);
    border-radius: 24px;
  }

  .slide-content-outer.narrow {
    max-width: 50vw;
  }

  .slide-content-outer.narrow h2 {
    margin-bottom: 1rem;
  }

  .slide-content-outer.narrow p {
    margin: 0;
  }
}

.slide-content-inner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (orientation: landscape) and (max-height: 500px) {
  .slide-content-outer .slide-content-inner {
    overflow-y: scroll;
  }

  .slide-content-outer.narrow .slide-content-inner {
    display: grid;
    grid-template-columns: 1fr auto;
    column-gap: calc(1.5rem - 10px);
  }

  .slide-content-outer.narrow .slide-content-inner p {
    max-height: calc(2 * 6rem + 0.5rem);
    padding-right: 10px;
    overflow: scroll;
  }
}
</style>
