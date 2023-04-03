<script>
// Vue functions
import { ref, watch, onMounted } from "vue";
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
import { isCmsView } from "../../src/utils.js";

/* CMS */
import CmsControls from "../../src/components/CmsControls.vue";
import { useCmsControlsStore } from "../../src/stores/cmscontrols.js";
/* /CMS */

export const myData = 42

function imageUrl(image, width = 0, height = 0) {
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

  if (isCmsView)
    return `/src/assets/data/img/${imgName}${sizeSuffix}.${fileExtension}`;
  else {
    return new URL(`../../src/assets/data/img/${imgName}${sizeSuffix}.${fileExtension}`, import.meta.url).href;
  }

}

function imageSizes(image) {
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
    prev[curr.size] = imageUrl(image, curr.width); return prev;
  }, {});
}

function gallerySrc(image, height = 96) {
  return imageUrl(image, 0, height);
}

function gallerySrcSet(image, baseHeight = 96) {
  let heights;

  if (baseHeight === 96)
    heights = ["96", "192", "288"];

  return heights
          .map((size, i) => `${gallerySrc(image, size)} ${i + 1}x`)
          .join(",");
}

function updatePageMeta(titleGetter, descriptionGetter) {
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
const props = defineProps({
  author: {
    type: String,
    required: false
  },
  slidesData: {
    type: Array,
    required: true
  },
  pageMeta: {
    type: Object,
    required: false
  }
});

const pageContext = usePageContext();

const routeParams = pageContext.routeParams;

const { t, locale } = useI18n();

const slides = ref(props.slidesData.map((slide) => {
  if (slide.mainImg) {
    slide.mainImgAttrs = {
      "data-pswp-width": slide.mainImg.width,
      "data-pswp-height": slide.mainImg.height,
      "data-cropped": true
    };
    slide.mainImgTitle = slide.mainImg.caption || "";

    if (!slide.mainImg.original)
      slide.mainImg = imageSizes(slide.mainImg.src);
  }

  if (slide.gallery) {
    slide.gallery.images = slide.gallery.images.map((galleryImg) => {
      galleryImg.imgAttrs = {
        src: gallerySrc(galleryImg.src, 0),
        srcset: gallerySrcSet(galleryImg.src),
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

  if (props.pageMeta) {
    const titleGetter = () => props.pageMeta.title ? t(props.pageMeta.title) : "",
      descriptionGetter = () => props.pageMeta.desc ? t(props.pageMeta.desc) : "";

    updatePageMeta(titleGetter, descriptionGetter);
    watch(locale, async () => { updatePageMeta(titleGetter, descriptionGetter); });
  }

  updatePageTheme(slides.value[0].theme);
});
</script>

<template>
  <div class="adventure-container">
    <!-- CMS -->
    <CmsControls v-if="cmsControlsStore.isCmsView" :slides="slides" :imageSizes="imageSizes"/>
    <!-- /CMS -->

    <AdventureLanguageSwitcher />

    <AdventureNavigation :slideCount="slides.length" :slideChange="slideChange" />

    <main id="adventure">
      <AdventureSlide
        v-for="(slide, i) in slides"
        v-bind:key="slide.id"
        :author="pageMeta.author"
        :slide="slide"
        :slideIdx="i"
        :slideChange="slideChange"
      />
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