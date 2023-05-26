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
import { escapeRegExp } from "../../src/utils.js";

/* CMS */
import CmsControls from "../../src/components/CmsControls.vue";
import CmsAdventureNewSlide from "../../src/components/adventure-slides/CmsAdventureNewSlide.vue";
import CmsConfirmActionPopup from "../../src/components/CmsConfirmActionPopup.vue";
import { useCmsControlsStore } from "../../src/stores/cmscontrols.js";
import { useConfirmationStore } from "../../src/stores/confirmation.js";
import { useImageLoader } from "../../src/composables/imageLoader";
/* /CMS */

export const myData = 42

function imageUrl(adventureId, image, width = 0, height = 0) {
  const imgMatch = image.match(/(?<imgName>.*?)(\.(?<imgExt>\w+))?$/),
        imgExtension = imgMatch.groups.imgExt || "jpg",
        isResized = width !== 0 || height !== 0,
        sizeSuffix = isResized ? `_${width}x${height}` : "";
  let fileExtension;

  if (isResized) {
    if (imgExtension === "png")
      fileExtension = "png";
    else
      fileExtension = "webp";
  } else {
    fileExtension = imgExtension;
  }

  // Doesn't work with SSR: new URL(`../../src/assets/data/img/${imgMatch.groups.imgName}${sizeSuffix}.${fileExtension}`, import.meta.url).href;
  return `/img/${adventureId}/${imgMatch.groups.imgName}${sizeSuffix}.${fileExtension}`;
}

function srcToUrls(adventureId, image) {
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

const getIdFromSrc = src => src.replace(/\..+?$/, "");
</script>

<script setup>
const pageContext = usePageContext(),
      adventure = ref(pageContext.pageProps.adventure),
      routeParams = pageContext.routeParams; // get the current URL path

const { t, locale, messages } = useI18n();

// TODO remove this computed. This is only here to reuse functions that generate image URLs -> these should be util functions or inside a composable.
const slides = computed(() => (adventure.value.slides || []).map((slide) => {
  if (slide.mainImg && typeof slide.mainImg.src !== "object") {
    slide.mainImg.id = getIdFromSrc(slide.mainImg.src);
    slide.mainImg.src = srcToUrls(adventure.value.meta.id, slide.mainImg.src);
  }

  if (slide.gallery) {
    slide.gallery.images = (slide.gallery.images || []).map((galleryImg) => {
      if (!/^\/img\//.test(galleryImg.src)) {
        galleryImg.id = getIdFromSrc(galleryImg.src);
        galleryImg.srcset = gallerySrcSet(adventure.value.meta.id, galleryImg.src);
        galleryImg.src = gallerySrc(adventure.value.meta.id, galleryImg.src, 0);
      }

      return galleryImg;
    });
  }

  return slide;
}));

const slideChange = ref({ last: 0, current: 0, duration: 0 });
const theme = ref("light");

/* CMS */
const cmsControlsStore = useCmsControlsStore(),
      confirmationStore = useConfirmationStore(),
      { loadImage } = useImageLoader();

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.ADD_SLIDE, async file => {
  const { imgFile, imgWidth, imgHeight } = await loadImage(file),
        formData = new FormData();

  formData.append("mainImg", imgFile);
  formData.append("slideIdx", slides.value.length + 1);
  formData.append("imgWidth", imgWidth);
  formData.append("imgHeight", imgHeight);

  fetch(`/rest/adventure/${adventure.value.meta.id}/slide`, {
    method: "PUT",
    body: formData
  }).then(res => {
    if (res.status !== 200)
      return

    res.json().then(data => {
      adventure.value.slides.push({
        id: data.id,
        mainImg: {
          src: data.src,
          width: imgWidth,
          height: imgHeight
        },
        transition: 0
      });
    });
  });
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.ADD_SLIDE_CONTENT, ({ slideId, headline, content }) => {
  const formData = new FormData(),
        currentLocale = locale.value;

  formData.append("headline", headline);
  formData.append("contentText", content.text);
  formData.append("contentPosition", content.position);
  formData.append("locale", currentLocale)

  fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/content`, {
    method: "PUT",
    body: formData
  }).then(res => {
    if (res.status === 201) {
      const slideToChange = adventure.value.slides.find(slide => slide.id === slideId),
            headlineTextModule = `${slideToChange.id}_headline`,
            contentTextModule = `${slideToChange.id}_content`;

      slideToChange.headline = headlineTextModule;
      slideToChange.content = {
        text: contentTextModule,
        position: content.position
      };

      messages.value[currentLocale][headlineTextModule] = headline;
      messages.value[currentLocale][contentTextModule] = content.text;
    }
  });
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.REMOVE_SLIDE, slideId => {
  const formData = new FormData();

  fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}`, {
    method: "DELETE",
    body: formData
  }).then((res) => {
    if (res.status === 200) {
      const slideIdxToRemove = adventure.value.slides.findIndex(slide => slide.id === slideId);

      adventure.value.slides.splice(slideIdxToRemove, 1);
    }
  });
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.EDIT_TEXT, ({ textModule, locale, newText }, resolve, reject) => {
  const formData = new FormData();

  formData.append("textModule", textModule);
  formData.append("locale", locale);
  formData.append("newText", newText);

  fetch(`/rest/adventure/${adventure.value.meta.id}/edit/text`, {
    method: "POST",
    body: formData
  }).then((res) => {
    if (res.status === 200) {
      messages.value[locale][textModule] = newText;

      resolve();
    } else {
      res.json().then(error => reject(error.message))
    }
  });
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.ADD_SLIDE_GALLERY_IMG, async ({ slideId, file }) => {
  const { imgFile, imgWidth, imgHeight } = await loadImage(file),
        formData = new FormData();

  formData.append("galleryImg", imgFile);
  formData.append("imgWidth", imgWidth);
  formData.append("imgHeight", imgHeight);
  
  fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/gallery`, {
    method: "POST",
    body: formData
  }).then(res => {
    if (res.status !== 200) {
      res.json().then(error => console.error(error));
      return;
    }

    res.json().then(data => {
      const slideToChange = adventure.value.slides.find(slide => slide.id === slideId);

      if (!slideToChange.gallery)
        slideToChange.gallery = {};

      if (!Array.isArray(slideToChange.gallery.images))
        slideToChange.gallery.images = [];

      slideToChange.gallery.images.push({
        id: getIdFromSrc(data.src),
        src: gallerySrc(adventure.value.meta.id, data.src, 0),
        srcset: gallerySrcSet(adventure.value.meta.id, data.src),
        width: imgWidth,
        height: imgHeight
      });
    });
  });
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.DEL_SLIDE_GALLERY_IMG, ({ slideId, src }) => {
  const formData = new FormData();

  formData.append("galleryImg", src);

  fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/gallery`, {
    method: "DELETE",
    body: formData
  }).then(res => {
    if (res.status !== 200) {
      res.json().then(error => console.error(error));
      return;
    }

    const slideToChange = adventure.value.slides.find(slide => slide.id === slideId),
          imgIndex = slideToChange.gallery.images.findIndex(galleryImg => new RegExp(escapeRegExp(src)).test(galleryImg.src));

    slideToChange.gallery.images.splice(imgIndex, 1);
  });
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.ADD_SLIDE_GALLERY_IMG_CAPTION, ({ slideId, imageId, captionTextModule }, resolve) => {
  const formData = new FormData();

  formData.append("captionTextModule", captionTextModule);

  fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/gallery/${imageId}/caption`, {
    method: "PUT",
    body: formData
  }).then(res => {
    if (res.status !== 200) {
      res.json().then(error => console.error(error));
      return;
    }

    const slideToChange = adventure.value.slides.find(slide => slide.id === slideId),
          galleryImgIndex = slideToChange.gallery && slideToChange.gallery.images && slideToChange.gallery.images.findIndex(galleryImg => new RegExp(escapeRegExp(imageId)).test(galleryImg.src));

    if (galleryImgIndex >= 0)
      slideToChange.gallery.images[galleryImgIndex].caption = captionTextModule;
    else
      slideToChange.mainImg.caption = captionTextModule;

    resolve();
  });
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.CHANGE_SLIDE_CONTENT_POSITION, ({ slideId, position }, resolve) => {
  const formData = new FormData();

  formData.append("contentPosition", position);

  fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/content`, {
    method: "POST",
    body: formData
  }).then(res => {
    if (res.status !== 200) {
      res.json().then(error => console.error(error));
      return;
    }

    const slideToChange = adventure.value.slides.find(slide => slide.id === slideId);

    if (slideToChange.content)
      slideToChange.content.position = position;

    resolve();
  });
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.CHANGE_SLIDE_GALLERY_STYLE, ({ slideId, style }, resolve) => {
  const formData = new FormData();

  formData.append("style", style);

  fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/gallery/props`, {
    method: "POST",
    body: formData
  }).then(res => {
    if (res.status !== 200) {
      res.json().then(error => console.error(error));
      return;
    }

    const slideToChange = adventure.value.slides.find(slide => slide.id === slideId);

    if (!slideToChange.gallery)
      slideToChange.gallery = {};

    slideToChange.gallery.style = style;

    resolve();
  });
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.DEL_SLIDE_CONTENT, ({ slideId }) => {
  fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/content`, {
    method: "DELETE"
  }).then(res => {
    if (res.status === 200) {
      const slideToChange = adventure.value.slides.find(slide => slide.id === slideId);

      slideToChange.headline = "";
      delete slideToChange.content;
      delete slideToChange.gallery;
    }
  });
});

/* /CMS */

watch(theme, (value) => updatePageTheme(value));

onMounted(() => {
  if (adventure.meta) {
    const titleGetter = () => adventure.meta.title ? t(adventure.meta.title) : "",
      descriptionGetter = () => adventure.meta.desc ? t(adventure.meta.desc) : "";

    updateAdventureMeta(titleGetter, descriptionGetter);
    watch(locale, async () => { updateAdventureMeta(titleGetter, descriptionGetter); });
  }

  if (slides.value.length > 0 && slides.value[0].theme) {
    updatePageTheme(slides.value[0].theme);
  }

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

        if (toSlide >= 0 && toSlide < slides.value.length)
          theme.value = slides.value[toSlide].theme;
      }
    });
  });
});
</script>

<template>
  <div class="adventure-container">
    <!-- CMS -->
    <CmsControls v-if="cmsControlsStore.isCmsView" :slides="slides" />

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
      />

      <!-- CMS -->
      <CmsAdventureNewSlide v-if="cmsControlsStore.editMode" />
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