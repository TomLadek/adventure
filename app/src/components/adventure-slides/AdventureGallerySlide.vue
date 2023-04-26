<script>
import { computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getCaptionText } from "../../../src/utils.js";

import AdventureSwiperGallery from "../AdventureSwiperGallery.vue";
import AdventureTextMultiline from "../adventure-text/AdventureTextMultiline.vue";

import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import PhotoSwipeDynamicCaption from "photoswipe-dynamic-caption-plugin";
import "photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css";
import "../../assets/photoswipe-dynamic-caption-plugin-custom.css";
</script>

<script setup>
let pswpInstance;

const props = defineProps({
  slide: {
    type: Object,
    required: true
  }
});

const slideContentClass = computed(() => {
  const baseClass = {
    narrow: props.slide.gallery && props.slide.gallery.style === "grid"
  };
  baseClass[props.slide.content.position] = true;
  return baseClass;
});

const { t, locale } = useI18n();

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
        return img.dataset.caption;

      return slide.data.element.dataset.caption;
    }
  });

  window.photoSwipes[props.slide.id] = pswpInstance;

  window.addEventListener("hashchange", closeAllPhotoSwipes);
}

watch(locale, async () => { initGallery() });

onMounted(initGallery);
</script>

<template>
  <section
    :id="`slide_${slide.id}`"
    class="slide-gallery"
  >
    <a
      v-if="slide.mainImg"
      :href="slide.mainImg.original"
      v-bind="slide.mainImgAttrs"
      :title="slide.mainImgTitle && getCaptionText(t(slide.mainImgTitle))"
      :data-caption="slide.mainImgTitle ? t(slide.mainImgTitle) : ''"
      target="_blank"
      class="main-picture"
    ></a>

    <div v-if="slide.headline || slide.content" class="content-outer" :class="slideContentClass">
      <h2 class="headline">{{ t(slide.headline) }}</h2>

      <div class="content-inner">
        <AdventureTextMultiline :locale="locale" :textModule="slide.content.text" />
  
        <AdventureSwiperGallery
          v-if="slide.gallery && slide.gallery.images && slide.gallery.images.length"
          :gallery="slide.gallery" />
      </div>
    </div>

    <slot v-else name="cmsAddSlideContentButton"></slot>

    <slot name="cmsRemoveSlideButton"></slot>
  </section>
</template>

<style>
.slide-gallery .content-outer {
  display: flex;
  flex-direction: column;

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

.slide-gallery .content-outer p {
  text-align: justify;
  hyphens: auto;
}

.slide-gallery .content-outer p:not(:first-child) {
  margin-top: 0.5em;
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

  .slide-gallery .content-outer.narrow h2 {
    margin-bottom: 1rem;
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
  max-height: 50vh;
  overflow-y: auto;
  padding: 0 5px;
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
</style>
