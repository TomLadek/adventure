<script>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { getCaptionText } from "../../src/utils.js";

/* CMS */
import { useCmsControlsStore } from "../stores/cmscontrols.js";
import { useConfirmationStore } from "../stores/confirmation.js";
import CmsAdventureItemButtonNew from "./CmsAdventureItemButtonNew.vue";
/* /CMS */
</script>

<script setup>
const props = defineProps({
  slideId: {
    type: String,
    required: true
  },
  gallery: {
    type: Object,
    required: true
  }
});

const { t } = useI18n();

let onImgMouseEnter = () => {}, onImgMouseLeave = () => {}

const galleryThumbsClass = computed(() => {
  const baseClass = {
    row: typeof props.gallery.style === "undefined"
  }

  if (props.gallery.style)
    baseClass[props.gallery.style] = true;

  return baseClass;
});

/* CMS */
const cmsControlsStore = useCmsControlsStore(),
      confirmationStore = useConfirmationStore(),
      nextGalleryImgInput = ref(null),
      imgControlsExpanded = ref({}),
      timeouts = {};

function onChooseNextGalleryImg(file) {
  cmsControlsStore.action(cmsControlsStore.actions.ADD_SLIDE_GALLERY_IMG, {
    slideId: props.slideId,
    file: file
  });
}

function onImgDeleteClick(src) {
  const pathSplit = src.split("/"),
        imgName = pathSplit[pathSplit.length - 1];

  confirmationStore.getConfirmation(
    `Remove image`,
    `Are you sure you want to remove image <b>${imgName}</b>? This will also delete its caption in all languages.`,
    () => cmsControlsStore.action(cmsControlsStore.actions.DEL_SLIDE_GALLERY_IMG, { slideId: props.slideId, src: imgName })
  )
}

onImgMouseEnter = id => {
  clearTimeout(timeouts[id]);
};

onImgMouseLeave = id => {
  timeouts[id] = setTimeout(() => imgControlsExpanded.value[id] = false, 1000);
};

function onBeforeLeave(element) {
  element.style.left = `${element.offsetLeft}px`;
  element.style.top = `${element.offsetTop}px`;
}
/* /CMS */
</script>

<template>
<div class="gallery-thumbs" :class="galleryThumbsClass">
  <TransitionGroup name="image-list" @before-leave="onBeforeLeave">
    <div class="gallery-img-container" v-for="image in gallery.images" @mouseenter="onImgMouseEnter(image.src)" @mouseleave="onImgMouseLeave(image.src)" :key="image.src">
      <a      
        v-bind:key="image.src"
        :href="image.src"
        :title="image.caption && getCaptionText(t(image.caption))"
        :data-pswp-width="image.width"
        :data-pswp-height="image.height"
        :data-id="image.id"
        data-cropped="true"
        target="_blank"
        class="gallery-original-link"
        >
        <img
          :src="image.src"
          :srcset="image.srcset"
          :width="image.width"
          :height="image.height"
          :alt="image.caption && getCaptionText(t(image.caption))"
          :data-caption="image.caption || 'none'"
          loading="lazy"
        />
      </a>

      <!-- CMS -->
      <div class="gallery-img-controls" :class="{ expanded: imgControlsExpanded[image.src] }" v-if="cmsControlsStore.editMode">
        <button class="button-more" @click="imgControlsExpanded[image.src] = !imgControlsExpanded[image.src]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <circle cx="6" cy="12" r="2"></circle>
            <circle cx="12" cy="12" r="2"></circle>
            <circle cx="18" cy="12" r="2"></circle>
          </svg>
        </button>
        <button class="button-delete" @click="onImgDeleteClick(image.src)">
          <svg xmlns="http://www.w3.org/2000/svg" transform="scale(0.75)" viewBox="0 0 24 24" width="24" height="24">
            <path d="M 10 2 L 9 3 L 4 3 L 4 5 L 5 5 L 5 20 C 5 20.522222 5.1913289 21.05461 5.5683594 21.431641 C 5.9453899 21.808671 6.4777778 22 7 22 L 17 22 C 17.522222 22 18.05461 21.808671 18.431641 21.431641 C 18.808671 21.05461 19 20.522222 19 20 L 19 5 L 20 5 L 20 3 L 15 3 L 14 2 L 10 2 z M 7 5 L 17 5 L 17 20 L 7 20 L 7 5 z M 9 7 L 9 18 L 11 18 L 11 7 L 9 7 z M 13 7 L 13 18 L 15 18 L 15 7 L 13 7 z"/>
          </svg>
        </button>
        <div class="button-close-container">
          <button class="button-close" @click="imgControlsExpanded[image.src] = false">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="white" stroke-width="2" stroke-linecap="round">
              <line x1="7" x2="17" y1="17" y2="7"></line>
              <line x1="7" x2="17" y1="7" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
      <!-- /CMS -->
    </div>
  </TransitionGroup>

  <!-- CMS -->
  <div v-if="cmsControlsStore.editMode" class="cms-new-gallery-image-outer">
    <CmsAdventureItemButtonNew class="cms-new-gallery-image-button" @click="nextGalleryImgInput.click()" size="small" />
    <input type="file" @change="onChooseNextGalleryImg($event.target.files[0])" accept="image/jpeg,image/png,image/gif" ref="nextGalleryImgInput">
  </div>
  <!-- /CMS -->
</div>
</template>

<style>
.gallery-thumbs.row, .gallery-thumbs.grid {
  display: flex;
  gap: 0.5rem;
  margin: 0 auto;
  max-width: 100%;
  min-height: calc(4rem + 10px);
  overflow-x: scroll;
  position: relative;
}

@media (min-width: 768px) {
  .gallery-thumbs {
    max-width: 30rem;
  }
}

.gallery-thumbs img {
  display: block;
  object-fit: cover;
  border-radius: 8px;
}

.gallery-thumbs.row img {
  height: 4rem;
  width: auto;
}

.gallery-thumbs.grid img {
  height: 4rem;
  width: 4rem;
}

@media (orientation: landscape) {
  .gallery-thumbs.grid {
    display: grid;
    grid-template-columns: repeat(2, 4rem);
    grid-template-rows: repeat(2, 4rem);
    row-gap: 0.5rem;
    column-gap: 0.5rem;
    align-self: center;
  }
  
  @media (min-height: 600px) {
    .gallery-thumbs.grid {
      grid-template-columns: repeat(2, 6rem);
      grid-template-rows: repeat(2, 6rem);
    }
  
    .gallery-thumbs.grid img {
      height: 6rem;
      width: 6rem;
    }    

    .gallery-thumbs.row img {
      height: 6rem;
    }  
  }
}

@media (orientation: portrait) {
  @media (min-height: 525px) {
    .gallery-thumbs.grid img {
      height: 4rem;
      width: auto;
    }
  }
  
  @media (min-height: 768px) {
    .gallery-thumbs.grid {
      display: grid;
      grid-template-columns: repeat(2, 6rem);
      grid-template-rows: repeat(2, 6rem);
      row-gap: 0.5rem;
      column-gap: 0.5rem;
      align-self: center;
    }
    
    .gallery-thumbs.row {
      min-height: calc(6rem + 10px);
    }

    .gallery-thumbs.grid img {
      height: 6rem;
      width: 6rem;
    }

    .gallery-thumbs.row img {
      height: 6rem;
    }    
  }
}


/* CMS */
.gallery-thumbs .gallery-img-container {
  position: relative;
}

.gallery-thumbs .gallery-img-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 24px;
  overflow-x: hidden;
  background: rgba(0, 0, 0, 0.68);
  color: white;
  backdrop-filter: blur(3px);
  padding: 0.2rem;
  display: flex;
  gap: 0.2rem;
  border-top-left-radius: 8px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 8px;
  transition-property: width, border-top-right-radius, border-bottom-right-radius;
  transition-duration: 0.15s;
  transition-timing-function: ease-out;
}

.gallery-thumbs .gallery-img-controls.expanded {
  width: calc(100% - 0.2rem * 2);  
  border-top-right-radius: 8px;
  border-bottom-right-radius: 0;
}

.gallery-thumbs .gallery-img-controls button {
  background: none;
  border: none;
  padding: 0;
  display: flex;
  color: inherit;
}

.gallery-thumbs .gallery-img-controls button svg {
  fill: white;
}

.gallery-thumbs .gallery-img-controls .button-more {
  width: 24px;
  transition: width, 0.15s ease-out;
}

.gallery-thumbs .gallery-img-controls.expanded .button-more {
  width: 0;
}

.gallery-thumbs .gallery-img-controls .button-close-container {
  display: flex;
  width: 100%;
  justify-content: flex-end;
}

.cms-new-gallery-image-outer {
  position: relative;
}

.slide .cms-new-gallery-image-outer .cms-new-gallery-image-button {
  width: 9rem;
  background: rgba(0, 0, 0, 0.2);
  border: 2px dashed black;
  border-radius: 1rem;
  padding: 0.5rem 0;
  transition: background-color 0.1s ease;
}

.slide .cms-new-gallery-image-outer .cms-new-gallery-image-button:hover {
  background-color: #57575752;
}

.slide .gallery-thumbs.grid .cms-new-gallery-image-outer .cms-new-gallery-image-button {
  width: 6rem;
  height: 6rem;
}

.slide .cms-new-gallery-image-outer input[type=file] {
  visibility: hidden;
  width: 0;
  height: 0;
}

.image-list-move,
.image-list-enter-active,
.image-list-leave-active {
  transition: all 0.25s ease-out;
}
.image-list-enter-from,
.image-list-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
.gallery-thumbs .gallery-img-container.image-list-leave-active {
  position: absolute;
}
/* /CMS */
</style>