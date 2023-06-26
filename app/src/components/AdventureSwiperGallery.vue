<script>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { getCaptionText } from "../../src/utils.js";

/* CMS */
import { useCmsControlsStore } from "../stores/cmscontrols.js";
import { useConfirmationStore } from "../stores/confirmation.js";
import CmsAdventureItemButtonNew from "./buttons/CmsAdventureItemButtonNew.vue";
import CmsOptionsButton from "./buttons/CmsOptionsButton.vue";
import CmsButtonClose from "./buttons/CmsButtonClose.vue";
import CmsButtonDelete from "./buttons/CmsButtonDelete.vue";
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

const showNewGalleryImgButton = computed(() => {
  if (!cmsControlsStore.editMode)
    return false;

  if (props.gallery.style === "grid" && props.gallery.images && props.gallery.images.length >= 4)
    return false;

  return true;
});

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
    `<p>Are you sure you want to remove image <b style="white-space: nowrap;">${imgName}</b>? This will also delete its caption in all languages.</p>`,
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
          class="gallery-img"
          loading="lazy"
        />
      </a>

      <!-- CMS -->
      <div class="gallery-img-controls" :class="{ expanded: imgControlsExpanded[image.src] }" v-if="cmsControlsStore.editMode">
        <CmsOptionsButton v-if="!imgControlsExpanded[image.src]" @click="imgControlsExpanded[image.src] = !imgControlsExpanded[image.src]" />

        <Transition name="expand-width">
          <div class="gallery-img-controls-actions" v-if="imgControlsExpanded[image.src]">
            <CmsButtonClose @click="imgControlsExpanded[image.src] = false"/>
            <CmsButtonDelete @click="onImgDeleteClick(image.src)" deleteWhatText="image" />
          </div>
        </Transition>
        </div>
      <!-- /CMS -->
    </div>
  </TransitionGroup>

  <!-- CMS -->
  <div v-if="showNewGalleryImgButton" class="cms-new-gallery-image-outer">
    <CmsAdventureItemButtonNew class="cms-new-gallery-image-button" @click="nextGalleryImgInput.click()" size="small" />
    <input class="cms-new-gallery-image-input" type="file" @change="onChooseNextGalleryImg($event.target.files[0])" accept="image/jpeg,image/png,image/gif" ref="nextGalleryImgInput">
  </div>
  <!-- /CMS -->
</div>
</template>

<style>
.gallery-thumbs {
  display: flex;
  gap: 0.5rem;
  margin: 0 auto;
  max-width: 100%;
  min-height: calc(4rem + 10px);
  overflow-x: scroll;
  position: relative;
}

.gallery-thumbs .gallery-original-link:hover .gallery-img, .gallery-thumbs .gallery-original-link:focus-visible .gallery-img {
    transform: scale(1.04);
}

.gallery-thumbs .gallery-img {
    transition: transform 0.3s ease-out;
}

.gallery-thumbs .gallery-original-link {
    overflow: hidden;
    display: block;
    border-radius: 8px;
}

.gallery-thumbs img {
  display: block;
  object-fit: cover;
}

.gallery-thumbs.row .gallery-img {
  width: auto;
  height: 4rem;
}

.gallery-thumbs.grid .gallery-img {
  width: 4rem;
  height: 4rem;
}

@media (orientation: landscape) {
  .gallery-thumbs.grid {
    display: grid;
    overflow: visible;
    grid-template-columns: repeat(2, 4rem);
    grid-template-rows: repeat(2, 4rem);
    row-gap: 0.5rem;
    column-gap: 0.5rem;
    align-self: start;
    margin-top: 5px;
    overflow: visible;
  }

  @media (min-height: 501px) {
    .gallery-thumbs.grid {
      margin-top: 0;
    }
  }
  
  @media (min-height: 600px) {
    .gallery-thumbs.row {
      min-height: calc(6rem + 10px);
    }

    .gallery-thumbs.grid {
      grid-template-columns: repeat(2, 6rem);
      grid-template-rows: repeat(2, 6rem);
    }
  
    .gallery-thumbs.grid .gallery-img {
      width: 6rem;
      height: 6rem;
    }    

    .gallery-thumbs.row .gallery-img {
      height: 6rem;
    }  
  }
}

@media (orientation: portrait) {
  .gallery-thumbs.grid .gallery-img {
    width: auto;
    height: 4rem;
  }
  
  @media (min-height: 768px) {
    .gallery-thumbs.grid {
      display: grid;
      overflow: visible;
      grid-template-columns: repeat(2, 6rem);
      grid-template-rows: repeat(2, 6rem);
      row-gap: 0.5rem;
      column-gap: 0.5rem;
      align-self: center;
    }
    
    .gallery-thumbs.row {
      min-height: calc(6rem + 10px);
    }

    .gallery-thumbs.grid .gallery-img {
      width: 6rem;
      height: 6rem;
    }

    .gallery-thumbs.row .gallery-img {
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
  width: 24px;
  overflow-x: hidden;
  background: rgba(0, 0, 0, 0.68);
  color: white;
  backdrop-filter: blur(3px);
  padding: 0.2rem;
  display: flex;
  border-top-left-radius: 8px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 8px;
  transition-property: width, border-top-right-radius, border-bottom-right-radius;
  transition-duration: 0.15s;
  transition-timing-function: ease-out;
}

.gallery-thumbs .gallery-img-controls.expanded {
  width: calc(100% - 0.2rem * 2); /**/
  border-top-right-radius: 8px;
  border-bottom-right-radius: 0;
}

.gallery-thumbs .gallery-img-controls .gallery-img-controls-actions {
  width: calc(48px + 0.2rem);
  display: flex;
  gap: 0.2rem;
  overflow-x: auto;
}

.gallery-thumbs .gallery-img-controls .gallery-img-controls-actions.expand-width-enter-active,
.gallery-thumbs .gallery-img-controls .gallery-img-controls-actions.expand-width-leave-active {
  transition: width 0.15s ease-out;
  overflow-x: hidden;
}

.gallery-thumbs .gallery-img-controls .gallery-img-controls-actions.expand-width-enter-from,
.gallery-thumbs .gallery-img-controls .gallery-img-controls-actions.expand-width-leave-to {
  width: 0;
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

.gallery-thumbs .gallery-img-controls .button-options {
  width: 24px;
  transition: width, 0.15s ease-out;
}

.gallery-thumbs .gallery-img-controls .button-close-container {
  display: flex;
  width: 100%;
  justify-content: flex-end;
}

.cms-new-gallery-image-outer {
  position: relative;
}

.cms-new-gallery-image-input {
  position: absolute;
  visibility: hidden;
  width: 0;
  height: 0;
}

.cms-new-gallery-image-button {
  background: rgba(0, 0, 0, 0.2);
  border: 2px dashed black;
  border-radius: 1rem;
  padding: 0.5rem 0;
  transition: background-color 0.1s ease;
}

.gallery-thumbs.row .cms-new-gallery-image-button {
  width: 6rem;
  height: 4rem;
}

.gallery-thumbs.grid .cms-new-gallery-image-button {
  width: 4rem;
  height: 4rem;
}

@media (orientation: landscape) {  
  @media (min-height: 600px) {  
    .gallery-thumbs.grid .cms-new-gallery-image-button {
      width: 6rem;
      height: 6rem;
    }    

    .gallery-thumbs.row .cms-new-gallery-image-button {
      width: 9rem;
      height: 6rem;
    }  
  }
}

@media (orientation: portrait) {
  .gallery-thumbs.grid .cms-new-gallery-image-button {
    width: 6rem;
    height: 4rem;
  }
  
  @media (min-height: 768px) {
    .gallery-thumbs.grid .cms-new-gallery-image-button {
      width: 6rem;
      height: 6rem;
    }    

    .gallery-thumbs.row .cms-new-gallery-image-button {
      width: 9rem;
      height: 6rem;
    }
  }
}

.cms-new-gallery-image-outer .cms-new-gallery-image-button:hover {
  background-color: #57575752;
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