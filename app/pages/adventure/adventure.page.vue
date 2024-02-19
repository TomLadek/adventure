<script>
// Vue functions
import { ref, computed, watch, onMounted, reactive } from "vue";
import { storeToRefs } from 'pinia';
import { useI18n } from "vue-i18n";

// Vue components
import AdventureSlide from "../../src/components/AdventureSlide.vue";
import AdventureLanguageSwitcher from "../../src/components/AdventureLanguageSwitcher.vue";
import AdventureNavigation from "../../src/components/AdventureNavigation.vue";

// Custom libraries
import "../../src/assets/gi-full-page-scroll.css";

// SSR
import { usePageContext } from "../../renderer/usePageContext.js";

// Misc
import { escapeRegExp, asyncTimeout, getImageUrl, getTextInLanguage } from "../../src/utils.js";

/* CMS */
import CmsControls from "../../src/components/CmsControls.vue";
import CmsAdventureNewSlide from "../../src/components/adventure-slides/CmsAdventureNewSlide.vue";
import CmsConfirmActionPopup from "../../src/components/CmsConfirmActionPopup.vue";
import CmsLinkPopup from "../../src/components/CmsLinkPopup.vue";
import { useCmsControlsStore } from "../../src/stores/cmscontrols.js";
import { useConfirmationStore } from "../../src/stores/confirmation.js";
import { useLinksStore } from "../../src/stores/links.js";
import { useImageLoader } from "../../src/composables/imageLoader";
/* /CMS */

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
    prev[curr.size] = getImageUrl(adventureId, image, curr.width); return prev;
  }, {});
}

function gallerySrc(adventureId, image, height = 96) {
  return getImageUrl(adventureId, image, 0, height);
}

function gallerySrcSet(adventureId, image, baseHeight = 96) {
  let heights;

  if (baseHeight === 96)
    heights = ["96", "192", "288"];

  return heights
          .map((size, i) => `${gallerySrc(adventureId, image, size)} ${i + 1}x`)
          .join(",");
}

function updatePageTheme(theme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme || "light");
}

export function getDocumentProps(pageProps) {
  const introSlide = pageProps.adventure.slides.find(slide => slide.intro),
        metaMainImg = (introSlide || pageProps.adventure.slides[0] || {}).mainImg,
        imageUrlPrefix = `${import.meta.env.VITE_DEPLOYMENT_HOST && import.meta.env.VITE_DEPLOYMENT_HOST !== 'localhost' ? `https://${import.meta.env.VITE_DEPLOYMENT_HOST}` : ''}`;

  return {
    title: getTextInLanguage(pageProps.adventure, pageProps.adventure.meta.title, "", true),
    description: introSlide && introSlide.content && introSlide.content.text ? getTextInLanguage(pageProps.adventure, introSlide.content.text, "", true) : null,
    image: metaMainImg ? `${imageUrlPrefix}${getImageUrl(pageProps.adventure.meta.id, metaMainImg.id || metaMainImg.src, 992)}` : ""
  }
}

const getIdFromSrc = src => src.replace(/\..+?$/, "");
</script>

<script setup>
const pageContext = usePageContext(),
      adventure = ref(pageContext.pageProps.adventure);

const { t, locale, messages } = useI18n();

// TODO remove this computed. This is only here to reuse functions that generate image URLs -> these should be util functions or inside a composable.
const slides = computed(() => (adventure.value.slides || []).map((slide) => {
  if (slide.mainImg && typeof slide.mainImg.src !== "object") {
    slide.mainImg.id = getIdFromSrc(slide.mainImg.src);
    slide.mainImg.src = srcToUrls(adventure.value.meta.id, slide.mainImg.src);
  }

  if (slide.gallery) {
    slide.gallery.images = (slide.gallery.images || []).map((galleryImg) => {
      if (!/\/img\//.test(galleryImg.src)) {
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

let getFullScrollSections = () => document.querySelectorAll("section"),
    getActivateFullScrollOnInit = () => true;

onMounted(() => {
  updatePageTheme(slides.value.length > 0 && slides.value[0].theme);

  import("../../src/assets/gi-full-page-scroll.js").then(() => {
    // Init full page scroll
    window.fs = new window.fullScroll({
      mainElement: "adventure",
      sections: getFullScrollSections(),
      sectionTransitions: slides.value.map((slide) => slide.transition || 0),
      activateOnInit: getActivateFullScrollOnInit(),
      onStartAnimate: (fromSlide, toSlide) => {
        slideChange.value = { last: fromSlide, current: toSlide, duration: 0.7 };

        if (toSlide >= 0 && toSlide < slides.value.length)
          updatePageTheme(slides.value[toSlide].theme);
      }
    });
  });
});

/* CMS */
const cmsControlsStore = useCmsControlsStore(),
      confirmationStore = useConfirmationStore(),
      linkStore = useLinksStore(),
      { fullScroll } = storeToRefs(cmsControlsStore),
      { loadImage } = useImageLoader();

getFullScrollSections = () => document.querySelectorAll("section:not(.cms-new-adventure-slide)");
getActivateFullScrollOnInit = () => fullScroll.value;

watch(fullScroll, (fullScrollValue) => {
  if (window.fs) {
    if (fullScrollValue)
      window.fs.activate();
    else
      window.fs.deactivate();
  }
});

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

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.ADD_SLIDE_CONTENT, ({ slideId, headline, subheadline, content }) => {
  const formData = new FormData(),
        currentLocale = locale.value;

  formData.append("headline", headline);
  formData.append("subheadline", subheadline);
  formData.append("contentText", content.text);
  formData.append("contentPosition", content.position);
  formData.append("locale", currentLocale);

  fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/content`, {
    method: "PUT",
    body: formData
  }).then(res => {
    if (res.status === 201) {
      const slideToChange = adventure.value.slides.find(slide => slide.id === slideId),
            headlineTextModule = `${slideToChange.id}_headline`,
            subheadlineTextModule = `${slideToChange.id}_subheadline`,
            contentTextModule = `${slideToChange.id}_content`;

      slideToChange.headline = headlineTextModule;
      slideToChange.subheadline = subheadlineTextModule;
      slideToChange.content = {
        text: contentTextModule,
        position: content.position
      };

      messages.value[currentLocale][headlineTextModule] = headline;
      messages.value[currentLocale][subheadlineTextModule] = subheadline;
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

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.EDIT_TEXT, async ({ textModule, locale, newText }, resolve, reject) => {
  const formData = new FormData();

  formData.append("textModule", textModule);
  formData.append("locale", locale);
  formData.append("newText", newText);

  let res = await fetch(`/rest/adventure/${adventure.value.meta.id}/edit/text`, {
    method: "POST",
    body: formData
  });
  
  if (res.status === 200) {
    messages.value[locale][textModule] = newText;

    resolve();
  } else {
    reject(await res.json());
  }
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.ADD_SLIDE_GALLERY_IMGS, async ({ slideId, files }) => {
  const slideToChange = adventure.value.slides.find(slide => slide.id === slideId),
        selectedImages = [],
        imagesToUpload = [];

  if (!slideToChange.gallery)
    slideToChange.gallery = {};

  if (!Array.isArray(slideToChange.gallery.images))
    slideToChange.gallery.images = [];

  for (const file of files)
    selectedImages.push(file);

  // First, sort the selected images by their lastModified date
  selectedImages.sort((a, b) => a.lastModified - b.lastModified);

  // Second, load the selected images to get their other data (widths, heights) and add them to this slide
  for (const selectedImage of selectedImages) {
      const { imgFile, imgWidth, imgHeight } = await loadImage(selectedImage),
            formData = new FormData(),
            imgObj = reactive({
              originalName: selectedImage.name,
              src: URL.createObjectURL(selectedImage),
              width: imgWidth,
              height: imgHeight,
              uploading: true
            });
    
      slideToChange.gallery.images.push(imgObj);
    
      formData.append("galleryImg", imgFile);
      formData.append("imgWidth", imgWidth);
      formData.append("imgHeight", imgHeight);
      
      imagesToUpload.push({ formData, imgObj });
  }

  // Third, upload the loaded images in the sorted order
  for (const imageToUpload of imagesToUpload) {
    const res = await fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/gallery`, {
      method: "POST",
      body: imageToUpload.formData
    });
  
    if (res.status !== 200) {
      res.json().then(error => console.error(error));
      return;
    }

    res.json().then(data => {
      imageToUpload.imgObj.id = getIdFromSrc(data.src);
      imageToUpload.imgObj.srcset = gallerySrcSet(adventure.value.meta.id, data.src);
      imageToUpload.imgObj.uploading = null;
    });    
  }
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.DEL_SLIDE_GALLERY_IMG, ({ slideId, id }) => {
  const formData = new FormData();

  formData.append("galleryImg", id);

  fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/gallery`, {
    method: "DELETE",
    body: formData
  }).then(res => {
    if (res.status !== 200) {
      res.json().then(error => console.error(error));
      return;
    }

    const slideToChange = adventure.value.slides.find(slide => slide.id === slideId),
          imgIndex = slideToChange.gallery.images.findIndex(galleryImg => new RegExp(escapeRegExp(id)).test(galleryImg.src));

    slideToChange.gallery.images.splice(imgIndex, 1);
  });
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.ADD_SLIDE_GALLERY_IMG_CAPTION, async ({ slideId, imageId, captionTextModule }, resolve, reject) => {
  const slideToChange = adventure.value.slides.find(slide => slide.id === slideId),
        galleryImg = slideToChange.gallery && slideToChange.gallery.images && slideToChange.gallery.images.find(galleryImg => galleryImg.id === imageId),
        isMainImgCaption = slideToChange.mainImg.id === imageId,
        formData = new FormData();

  let res;

  formData.append("captionTextModule", captionTextModule);

  if (isMainImgCaption) {
    res = await fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/mainImg/caption`, {
      method: "PUT",
      body: formData
    });
  } else {
    res = await fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/gallery/${imageId}/caption`, {
      method: "PUT",
      body: formData
    });
  }

  if (res.status !== 200) {
    const error = await res.json();

    console.error(error);
    reject(error);

    return;
  }

  if (isMainImgCaption)
    slideToChange.mainImg.caption = captionTextModule;
  else
    galleryImg.caption = captionTextModule;

  resolve();
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

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.CHANGE_SLIDE_GALLERY_STYLE, ({ slideId, style }, resolve, reject) => {
  const formData = new FormData();

  formData.append("style", style);

  fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/gallery/props`, {
    method: "POST",
    body: formData
  }).then(res => {
    if (res.status !== 200) {
      res.json().then(error => {
        console.error(error);
        reject(error);
      });
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

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.CHANGE_SLIDE_PROPS, async ({ slideId, props }, resolve, reject) => {
  const formData = new FormData();

  for (const prop of Object.keys(props)) {
    formData.append(prop, props[prop]);
  }

  const res = await fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/props`, {
    method: "POST",
    body: formData
  });

  if (res.status !== 200) {
    const error = await res.json();
    console.error(error);
    reject(error);
    return;
  }

  const slideToChange = adventure.value.slides.find(slide => slide.id === slideId);

  for (const prop of Object.keys(props)) {
    slideToChange[prop] = props[prop];
  }

  resolve();
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.CHANGE_SLIDE_GALLERY_IMG_POSITION, async ({ slideId, imageId, direction }) => {
  const formData = new FormData();

  formData.append("direction", direction);

  const res = await fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/gallery/${imageId}/move`, {
    method: "POST",
    body: formData
  });

  if (res.status !== 200) {
    const error = await res.json();
    console.error(error.message);
    return;
  }

  const slideToChange = adventure.value.slides.find(slide => slide.id === slideId),
        imgToMoveIdx = slideToChange.gallery.images.findIndex(img => img.id === imageId),
        neighborimgIdx = imgToMoveIdx + (direction === "prev" ? -1 : 1),
        neighborImg = neighborimgIdx >= 0 && neighborimgIdx < slideToChange.gallery.images.length && slideToChange.gallery.images[neighborimgIdx]

  // console.log(`moving ${imageId} from index ${imgToMoveIdx} to index ${neighborimgIdx} (neighbor image: ${neighborImg && neighborImg.id})`)

  if (neighborImg) {
    slideToChange.gallery.images.sort((a, b) => {
      if (a.id === neighborImg.id && b.id === imageId)
          return direction === "prev" ? 1 : -1;

      if (b.id === neighborImg.id && a.id === imageId)
        return direction === "prev" ? -1 : 1;

      return 0;
    });
  }
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.PUBLISH, async (_, resolve, reject) => {
  const res = await fetch(`/rest/adventure/${adventure.value.meta.id}/publish`, {
    method: "POST"
  });

  if (res.status === 200) {
    const publishedDate = (await res.json()).publishedDate;

    adventure.value.meta.lastPublishDate = publishedDate;

    resolve();
  } else {
    console.error(res);
    reject((await res.json()).message)
  }
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.TRANSLATE_TEXT, async ({ text, sourceLocale, targetLocale }, resolve, reject) => {
  const formData = new FormData();

  if (sourceLocale)
    formData.append("sourceLocale", sourceLocale);

  formData.append("text", text);

  const res = await fetch(`/rest/adventure/translate/${targetLocale}`, {
    method: "POST",
    body: formData
  });

  if (res.status === 200)
    resolve((await res.json()).translation);
  else
    reject((await res.json()).message);
});

cmsControlsStore.subscribeToAction(cmsControlsStore.actions.CHANGE_SLIDE_MAIN_IMG, async ({ slideId, file }, resolve, reject) => {
  const { imgFile, imgWidth, imgHeight } = await loadImage(file),
          formData = new FormData();

  formData.append("mainImg", imgFile);
  formData.append("imgWidth", imgWidth);
  formData.append("imgHeight", imgHeight);

  const res = await fetch(`/rest/adventure/${adventure.value.meta.id}/slide/${slideId}/mainImg`, {
    method: "POST",
    body: formData
  });

  if (res.status === 200) {
    const slideToChange = slides.value.find(slide => slide.id === slideId),
          data = await res.json();

    // wait for the selected image to render fully and the transitions to finish before replacing the path to the old one
    await asyncTimeout(600);

    slideToChange.mainImg.src = data.src;
    slideToChange.mainImg.width = imgWidth;
    slideToChange.mainImg.height = imgHeight;

    resolve();
  } else {
    reject((await res.json()).message);
  }
});
/* /CMS */
</script>

<template>
  <div class="adventure-container">
    <!-- CMS -->
    <CmsControls v-if="cmsControlsStore.isCmsView" :adventure="adventure" />

    <CmsConfirmActionPopup :confirmPopupShowing="confirmationStore.pending" />

    <CmsLinkPopup :linkPopupShowing="linkStore.pending"/>
    <!-- /CMS -->

    <AdventureLanguageSwitcher />

    <AdventureNavigation :slides="slides" :slideChange="slideChange" />

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
body {
  overflow: hidden;
}

.slide-themed, .slide-themed button {
  transition-property: color, backdrop-filter, -webkit-backdrop-filter;
  transition-duration: var(--default-anim-time);
  transition-timing-function: ease;
}

.light .slide-themed button {
  color: var(--color-white);
}

.dark .slide-themed button {
  color: var(--color-black);
}

/* CMS */
body {
  overflow: initial;
}
/* /CMS */
</style>