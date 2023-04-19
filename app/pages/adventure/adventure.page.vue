<script>
// Vue functions
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";

// Vue components
import AdventureSlide from "../../src/components/AdventureSlide.vue";
import AdventureLanguageSwitcher from "../../src/components/AdventureLanguageSwitcher.vue";
import AdventureNavigation from "../../src/components/AdventureNavigation.vue";

// Custom libraries
import { gsap } from "gsap";
import "../../src/assets/gi-full-page-scroll.css";

// SSR
import { usePageContext } from "../../renderer/usePageContext.js";

// Misc
import { isCmsView } from "../../utils/utils.js";

/* CMS */
import CmsControls from "../../src/components/CmsControls.vue";
import CmsAdventureNewSlide from "../../src/components/adventure-slides/CmsAdventureNewSlide.vue";
import CmsConfirmActionPopup from "../../src/components/CmsConfirmActionPopup.vue";
import { useCmsControlsStore } from "../../src/stores/cmscontrols.js";
import { useConfirmationStore } from "../../src/stores/confirmation.js";
/* /CMS */

export const myData = 42

function imageUrl(adventureId, image, width = 0, height = 0) {
  const imgMatch = image.match(/(.*?)(\.(\w+))?$/),
    imgName = imgMatch[1],
    imgExtension = imgMatch[3] || "jpg",
    isResized = width != 0 || height != 0,
    sizeSuffix = isResized ? `_${width}x${height}` : "";
  let fileExtension;

  if (isResized) {
    if (imgExtension === "png")
      fileExtension = imgExtension;
    else
      fileExtension = "webp";
  } else {
    fileExtension = imgExtension;
  }

  // Doesn't work with SSR: new URL(`../../src/assets/data/img/${imgName}${sizeSuffix}.${fileExtension}`, import.meta.url).href;
  return `/img/${adventureId}/${imgName}${sizeSuffix}.${fileExtension}`;
}

function imageSizes(adventureId, image) {
  return [
    {size: "original", width: 0},
    {size: "xs", width: 576},
    {size: "sm", width: 768},
    {size: "md", width: 992},
    {size: "lg", width: 1200},
    {size: "xl", width: 1400},
    {size: "xxl", width: 1600},
    {size: "xxxl", width: 1920},
    {size: "xxxxl", width: 2200}
  ].reduce((prev, curr) => {
    prev[curr.size] = imageUrl(adventureId, image, curr.width); return prev;
  }, {});
}

function gallerySrc(adventureId, image, height = 96) {
  return imageUrl(adventureId, image, 0, height);
}

function gallerySrcSet(adventureId, image, baseHeight = 96) {
  let heights;

  if (baseHeight === 96)
    heights = ["96", "192", "288"];

  return heights
          .map((size, i) => `${gallerySrc(adventureId, image, size)} ${i + 1}x`)
          .join(",");
}

function updateAdventureMeta(titleGetter, descriptionGetter) {
  const title = titleGetter(),
    description = descriptionGetter();

  if (title)
    document.title = title;

  if (description)
    document.querySelector("meta[name=description]").setAttribute("content", description);
}

function updatePageTheme(theme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme || "light");
}
</script>

<script setup>
const pageContext = usePageContext(),
      adventure = ref(pageContext.pageProps.adventure),
      routeParams = pageContext.routeParams; // get the current URL path

const { t, locale } = useI18n();

const slides = computed(() => (adventure.value.slides || []).map((slide) => {
  if (slide.mainImg) {
    slide.mainImgAttrs = {
      "data-pswp-width": slide.mainImg.width,
      "data-pswp-height": slide.mainImg.height,
      "data-cropped": true
    };
    slide.mainImgTitle = slide.mainImg.caption || "";

    if (!slide.mainImg.original)
      slide.mainImg = imageSizes(adventure.value.meta.id, slide.mainImg.src);
  }

  if (slide.gallery) {
    slide.gallery.images = slide.gallery.images.map((galleryImg) => {
      galleryImg.imgAttrs = {
        src: gallerySrc(adventure.value.meta.id, galleryImg.src, 0),
        srcset: gallerySrcSet(adventure.value.meta.id, galleryImg.src),
        width: galleryImg.width,
        height: galleryImg.height
      };
      galleryImg.title = galleryImg.caption,
      galleryImg.alt = galleryImg.caption,
      galleryImg.pswpImgAttrs = {
        "data-pswp-width": galleryImg.width,
        "data-pswp-height": galleryImg.height,
        "data-cropped": true
      };

      delete galleryImg.caption;
      delete galleryImg.width;
      delete galleryImg.height;

      return galleryImg;
    });
  }

  return slide;
}));

const slideChange = ref({ last: 0, current: 0, duration: 0 });
const theme = ref("light");

/* CMS */
const cmsControlsStore = useCmsControlsStore();
const confirmationStore = useConfirmationStore();

function onAddSlide(file) {
  console.log("onAddSlide", file)
  
  function createImage(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      console.log("onload", e.target.result);
    };
    reader.readAsDataURL(file);
  }

  const formData = new FormData();

  formData.append("slide", "add");
  formData.append("slideIdx", slides.value.length + 1);
  formData.append("mainImg", file);

  fetch(`/rest/adventure/${adventure.value.meta.id}/edit`, {
    method: "POST",
    body: formData
  }).then(res => {
    if (res.status === 200) {
      res.json().then(ok => {
        adventure.value.slides.push({
          id: ok.newSlideId,
          mainImg: {
            src: "PXL_20230205_115940933",
            caption: "Dummy Caption",
            "width": 4080,
            "height": 3072
          },
          transition: 0,
          headline: "MyDummyHeadline",
          content: {
            text: "Dummy Content",
            position: "bottom end"
          },
        })
      });
    }
  });
}

function onRemoveSlide(id) {
  const formData = new FormData();

  formData.append("slide", "remove");
  formData.append("slideId", id);

  fetch(`/rest/adventure/${adventure.value.meta.id}/edit`, {
    method: "POST",
    body: formData
  }).then((res) => {
    if (res.status === 200) {
      const slideIdxToRemove = adventure.value.slides.findIndex(slide => slide.id === id);

      adventure.value.slides.splice(slideIdxToRemove, 1);
    }
  })
}
/* /CMS */

watch(theme, (value) => updatePageTheme(value));

onMounted(() => {
  window.gsap = gsap;

  import("../../src/assets/gi-full-page-scroll.js").then(() => {
    // Init full page scroll
    window.fs = new window.fullScroll({
      mainElement: "adventure",
      sections: document.querySelectorAll("section"),
      sectionTransitions: slides.value.map((slide) => slide.transition || 0),
      activateOnInit: false,
      onStartAnimate: (fromSlide, toSlide) => {
        slideChange.value = { last: fromSlide, current: toSlide, duration: 0.7 };
        theme.value = slides.value[toSlide].theme;
      }
    });
  });

  if (adventure.meta) {
    const titleGetter = () => adventure.meta.title ? t(adventure.meta.title) : "",
      descriptionGetter = () => adventure.meta.desc ? t(adventure.meta.desc) : "";

    updateAdventureMeta(titleGetter, descriptionGetter);
    watch(locale, async () => { updateAdventureMeta(titleGetter, descriptionGetter); });
  }

  if (slides.value.length > 0 && slides.value[0].theme) {
    updatePageTheme(slides.value[0].theme);
  }
});
</script>

<template>
  <div class="adventure-container">
    <!-- CMS -->
    <CmsControls v-if="cmsControlsStore.isCmsView" :slides="slides" :imageSizes="imageSizes"/>

    <CmsConfirmActionPopup :confirmPopupShowing="confirmationStore.pending" />
    <!-- /CMS -->

    <AdventureLanguageSwitcher />

    <AdventureNavigation :slideCount="slides.length" :slideChange="slideChange" />

    <main id="adventure">
      <AdventureSlide
        v-for="(slide, i) in slides"
        v-bind:key="slide.id"
        :adventureMeta="adventure.meta"
        :slide="slide"
        :slideIdx="i"
        :slideChange="slideChange"
        @removeSlideClick="onRemoveSlide"
      />

      <!-- CMS -->
      <CmsAdventureNewSlide @addSlide="onAddSlide"/>
      <!-- /CMS -->
    </main>
  </div>
</template>

<style>
.adventure-container {
  color: var(--color-white);
  transition: color var(--default-anim-time) ease;
}

.dark .adventure-container {
  color: var(--color-black);
}
</style>