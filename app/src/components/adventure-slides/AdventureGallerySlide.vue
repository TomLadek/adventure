<script>
import { ref, computed, onMounted, watch, h, render } from "vue";
import { useI18n } from "vue-i18n";
import { getCaptionText } from "../../../src/utils.js";
import { useI18nBundle } from "../../composables/i18nBundle";

import AdventureSwiperGallery from "../AdventureSwiperGallery.vue";

import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import PhotoSwipeDynamicCaption from "photoswipe-dynamic-caption-plugin";
import "photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css";
import "../../assets/photoswipe-dynamic-caption-plugin-custom.css";

/* CMS */
import CmsAdventureItemButtonNew from "../CmsAdventureItemButtonNew.vue";
import CmsEditableText from "../CmsEditableText.vue";
import { useCmsControlsStore } from "../../stores/cmscontrols.js";
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

const slideContentClass = computed(() => {
  const baseClass = {
    narrow: props.slide.gallery && props.slide.gallery.style === "grid"
  };
  baseClass[props.slide.content.position] = true;
  return baseClass;
});

const { t, locale } = useI18n(),
      { i18nBundle } = useI18nBundle(),
      cmsControlsStore = useCmsControlsStore();

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
    captionContent: (pswpSlide) => {
      const img = pswpSlide.data.element.querySelector("img");

      if (img)
        return img.dataset.caption;

      return pswpSlide.data.element.dataset.caption;
    }
  });

  /* CMS */
  pswpInstance.on("dynamicCaptionUpdateHTML", ({ captionElement }) => {
    const captionTextModule = captionElement.innerHTML,
          cmsEditableTextFocusAction = ref();

    captionElement.innerHTML = "";

    render(
      h(
        CmsEditableText,
        {
          i18n: i18nBundle.value,
          textModule: captionTextModule,
          onBlur: () => {
            pswpInstance.dispatch("bindEvents");
          },
          focusAction: cmsEditableTextFocusAction
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

      cmsEditableTextFocusAction.value = Math.random();
    })
  });
  /* /CMS */

  window.photoSwipes[props.slide.id] = pswpInstance;

  window.addEventListener("hashchange", closeAllPhotoSwipes);
}

watch(locale, initGallery);

onMounted(initGallery);

/* CMS */
const firstGalleryImgInput = ref(null);

function onChooseFirstGalleryImg(file) {
  cmsControlsStore.action(cmsControlsStore.actions.ADD_SLIDE_GALLERY_IMG, {
    slideId: props.slide.id,
    imgIdx: 1,
    file: file
  });  
}
/* /CMS */
</script>

<template>
  <section
    :id="`slide_${slide.id}`"
    class="slide-gallery"
  >
    <a
      v-if="slide.mainImg.src"
      :href="slide.mainImg.src.original"
      :data-pswp-width="slide.mainImg.width"
      :data-pswp-height="slide.mainImg.height"
      data-cropped="true"
      :title="slide.mainImg.caption && getCaptionText(t(slide.mainImg.caption))"
      :data-caption="slide.mainImg.caption"
      target="_blank"
      class="main-picture"
    ></a>

    <div v-if="slide.headline || slide.content" class="content-outer" :class="slideContentClass">
      <h2 class="headline">
        <CmsEditableText :i18n="i18nBundle" :text-module="slide.headline" />
      </h2>

      <div class="content-inner">
        <CmsEditableText :i18n="i18nBundle" :textModule="slide.content.text" :isMultiline="true" editorControlsPosition="fixed" />
  
        <AdventureSwiperGallery
          v-if="slide.gallery && slide.gallery.images && slide.gallery.images.length"
          :gallery="slide.gallery" />

        <div v-else-if="cmsControlsStore.editMode" class="cms-new-gallery-outer">
          <CmsAdventureItemButtonNew class="cms-new-gallery-button" @click="firstGalleryImgInput.click()" size="small" />
          <input type="file" @change="onChooseFirstGalleryImg($event.target.files[0])" accept="image/jpeg,image/png,image/gif" ref="firstGalleryImgInput">
        </div>
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
  padding: 0 5px;
  overflow-y: auto;
}

.slide-gallery .content-outer .content-inner p {
  text-align: justify;
  hyphens: auto;
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

div.pswp__bg {
  display: initial; /* Override div:empty{display:none} */
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
  visibility: hidden;
  width: 0;
  height: 0;
}
/* /CMS */
</style>
