<script>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useVI18nAttr } from "../composables/vI18nAttr.js";

/* CMS */
import { useCmsControlsStore } from "../stores/cmscontrols.js";
import { useConfirmationStore } from "../stores/confirmation.js";
import CmsAdventureItemButtonNew from "./buttons/CmsAdventureItemButtonNew.vue";
import CmsOptionsButton from "./buttons/CmsOptionsButton.vue";
import CmsButtonClose from "./buttons/CmsButtonClose.vue";
import CmsButtonDelete from "./buttons/CmsButtonDelete.vue";
import CmsButtonArrow from "./buttons/CmsButtonArrow.vue";
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

const { locale } = useI18n(),
      { vI18nAttr } = useVI18nAttr();

const galleryThumbsClass = computed(() => {
  const baseClass = {
    row: typeof props.gallery.style === "undefined"
  }

  if (props.gallery.style)
    baseClass[props.gallery.style] = true;

  return baseClass;
});

let showGalleryContainer = computed(() => props.gallery.images && props.gallery.images.length)

let draggableClass = undefined,
  onImgMouseEnter = () => {},
  onImgMouseLeave = () => {},
  onBeforeLeave = () => {},
  onDraggableElementMouseDown = () => {},
  onDraggableElementTouchStart = () => {};

/* CMS */
const cmsControlsStore = useCmsControlsStore(),
      confirmationStore = useConfirmationStore(),
      nextGalleryImgInput = ref(null),
      imgControlsExpanded = ref({}),
      timeouts = {},
      reorderState = [],
      draggableElements = ref([]),
      draggableParent = ref(null),
      movingImageClass = "image-list-move";

const showNewGalleryImgButton = computed(() => {
  if (!cmsControlsStore.editMode)
    return false;

  if (props.gallery.style === "grid" && props.gallery.images && props.gallery.images.length >= 4)
    return false;

  if (props.gallery.images && props.gallery.images.length >= 19) /* Limit upload to 19 gallery images (makes 20 with the intro image) */
    return false;

  return true;
});

showGalleryContainer = computed(() => (props.gallery.images && props.gallery.images.length) || cmsControlsStore.editMode)

let originalPointerX = 0, originalPointerY = 0, currentPointerX = null, currentPointerY = null, clone = null, containerScrollTimeout = null;

function onChooseNextGalleryImages(files) {
  cmsControlsStore.action(cmsControlsStore.actions.ADD_SLIDE_GALLERY_IMGS, {
    slideId: props.slideId,
    files
  });
}

function onMoveImage(imageId, direction) {
  const imgIdx = props.gallery.images.findIndex(img => img.id === imageId),
    newOrder = [];

  for (let i = 0; i < props.gallery.images.length; i++)
    newOrder.push(i);

  newOrder.splice(imgIdx, 1);
  newOrder.splice(direction === "prev" ? imgIdx - 1 : imgIdx + 1, 0, imgIdx);

  console.log("newOrder", newOrder);

  cmsControlsStore.action(cmsControlsStore.actions.CHANGE_SLIDE_GALLERY_IMAGE_ORDER, {
    slideId: props.slideId,
    newOrder
  });
}

function onImgDeleteClick(id) {
  confirmationStore.getConfirmation(
    `Remove image`,
    `<p>Are you sure you want to remove image <b style="white-space: nowrap;">${id}</b>? This will also delete its caption in all languages.</p>`,
    () => cmsControlsStore.action(cmsControlsStore.actions.DEL_SLIDE_GALLERY_IMG, { slideId: props.slideId, id: id })
  )
}

onImgMouseEnter = id => {
  clearTimeout(timeouts[id]);
};

onImgMouseLeave = id => {
  timeouts[id] = setTimeout(() => imgControlsExpanded.value[id] = false, 1000);
};

onBeforeLeave = element => {
  element.style.left = `${element.offsetLeft}px`;
  element.style.top = `${element.offsetTop}px`;
};

draggableClass = computed(() => {
  if (typeof props.gallery.style === "undefined")
    return 'draggable-row-item';
  else
    return `draggable-${props.gallery.style}-item`;
});

onDraggableElementMouseDown = (i, event) => {
  if (!cmsControlsStore.editMode)
    return;

  // console.log("onDraggableElementMouseDown", i, "|", event.clientX, event.clientY);
  const element = draggableElements.value[i],
    links = element.querySelectorAll("a");
  let draggedIdx = i,
    mouseMoveListener, mouseUpListener;

  originalPointerX = event.clientX;
  originalPointerY = event.clientY;
  
  for (const i in props.gallery.images)
    reorderState[i] = i;

  toggleContainerScroll(true);

  mouseUpListener = () => {
    document.removeEventListener("mouseup", mouseUpListener);
    document.removeEventListener("mousemove", mouseMoveListener);
    
    if (element.viewIsDragged) {
      console.log("drag finished");
      element.viewIsDragged = false;
      element.classList.remove("dragging");
      document.documentElement.style.userSelect = null;
      links.forEach(l => l.style.pointerEvents = null);

      toggleContainerScroll(false);
      discardClone();

      cmsControlsStore.action(cmsControlsStore.actions.CHANGE_SLIDE_GALLERY_IMAGE_ORDER, {
        slideId: props.slideId,
        newOrder: reorderState,
        ignoreModel: true
      });
    }
  };

  mouseMoveListener = (ev) => {
    if (Math.abs(ev.clientX - originalPointerX) > 10 || Math.abs(ev.clientY - originalPointerY) > 10) {
      if (!element.viewIsDragged) {
        console.log("drag started");
        element.viewIsDragged = true;
        element.classList.add("dragging");
        document.documentElement.style.userSelect = "none";
        links.forEach(l => l.style.pointerEvents = "none");
        initializeClone(element);        
      }

      currentPointerX = ev.clientX;
      currentPointerY = ev.clientY;

      moveClone(ev.clientX, ev.clientY);

      let switchCandidate = null;

      for (const elIdx in draggableElements.value) {
        const el = draggableElements.value[elIdx];

        // skip elements having "dragging" class and class denoted by movingImageClass
        if (el.classList.contains("dragging") || el.classList.contains(movingImageClass))
          continue;

        const elRect = el.getBoundingClientRect(),
          elX1 = elRect.left + window.scrollX,
          elX2 = elRect.left + window.scrollX + elRect.width,
          elY1 = elRect.top,
          elY2 = elRect.top + elRect.height,
          pointerInsideMarginBox = ev.clientX > elX1 + 0.1 * elRect.width && ev.clientX < elX2 - 0.1 * elRect.width
            && ev.clientY > elY1 + 0.1 * elRect.height && ev.clientY < elY2 - 0.1 * elRect.height;

        //console.log(elIdx, `${elX1}/${elY1}`, `${elX2}/${elY2}`, pointerInsideMarginBox);
        
        if (elIdx != draggedIdx && pointerInsideMarginBox) {
          switchCandidate = elIdx;
        }
      }

      if (switchCandidate) {
        switchDraggable(draggedIdx, switchCandidate);
        draggedIdx = switchCandidate;
      }
    }
  };

  document.addEventListener("mousemove", mouseMoveListener);
  document.addEventListener("mouseup", mouseUpListener);
};

onDraggableElementTouchStart = (i, event) => {
  if (!cmsControlsStore.editMode)
    return;

  // console.log("onDraggableElementTouchStart", i, "|", event.touches[0].clientX, event.touches[0].clientY);
  const element = draggableElements.value[i],
    links = element.querySelectorAll("a");
  let draggedIdx = i,
    touchMoveListener, touchEndListener;

  originalPointerX = event.touches[0].clientX;
  originalPointerY = event.touches[0].clientY;

  for (const i in props.gallery.images)
    reorderState[i] = i;

  toggleContainerScroll(true);

  const touchTimeout = setTimeout(() => {
    console.log("drag started (touch)")
    element.viewIsDragged = true;
    element.classList.add("dragging");
    document.body.style.overflow = "hidden";
    document.documentElement.style.userSelect = "none";
    links.forEach(l => l.style.pointerEvents = "none");
    initializeClone(element);
  }, 667);

  touchEndListener = () => {
    clearTimeout(touchTimeout);
    
    if (element.viewIsDragged) {
      console.log("drag finished (touch)");
      element.viewIsDragged = false;
      element.classList.remove("dragging");
      document.documentElement.style.userSelect = null;
      document.body.style.overflow = null;
      links.forEach(l => l.style.pointerEvents = null);

      toggleContainerScroll(false);
      discardClone();

      cmsControlsStore.action(cmsControlsStore.actions.CHANGE_SLIDE_GALLERY_IMAGE_ORDER, {
        slideId: props.slideId,
        newOrder: reorderState,
        ignoreModel: true
      });
    }
  };

  touchMoveListener = (e) => {
    if (element.viewIsDragged) {
      // console.log("dragging!", e.touches[0].clientX, e.touches[0].clientY);

      currentPointerX = e.touches[0].clientX;
      currentPointerY = e.touches[0].clientY;

      moveClone(e.touches[0].clientX, e.touches[0].clientY);

      let switchCandidate = null;

      for (const elIdx in draggableElements.value) {
        const el = draggableElements.value[elIdx];

        // skip elements having "dragging" class and class denoted by movingImageClass
        if (el.classList.contains("dragging") || el.classList.contains(movingImageClass))
          continue;

          const elRect = el.getBoundingClientRect(),
            elX1 = elRect.left + window.scrollX,
            elX2 = elRect.left + window.scrollX + elRect.width,
            elY1 = elRect.top,
            elY2 = elRect.top + elRect.height,
            pointerInsideMarginBox = e.touches[0].clientX > elX1 + 0.1 * elRect.width && e.touches[0].clientX < elX2 - 0.1 * elRect.width
              && e.touches[0].clientY > elY1 + 0.1 * elRect.height && e.touches[0].clientY < elY2 - 0.1 * elRect.height;

        //console.log(elIdx, `${elX1}/${elY1}`, `${elX2}/${elY2}`, pointerInsideMarginBox);

        if (elIdx != draggedIdx && pointerInsideMarginBox) {
          switchCandidate = elIdx;
        }
      }

      if (switchCandidate) {
        switchDraggable(draggedIdx, switchCandidate);
        draggedIdx = switchCandidate;
      }
    } else {
      // console.log("touchmove", e.touches[0].clientX, e.touches[0].clientY);
      clearTimeout(touchTimeout);
      document.removeEventListener("touchmove", touchMoveListener);
      document.removeEventListener("touchend", touchEndListener);
    }
  };

  document.addEventListener("touchmove", touchMoveListener);
  document.addEventListener("touchend", touchEndListener);
};

function initializeClone(element) {
  clone = element.cloneNode(true);
  clone.style.position = "absolute";
  clone.style.zIndex = 1000;
  clone.classList.add("draggable-clone");
  clone.classList.add(element.dataset.draggableClass);
  clone.style.top = `${element.offsetTop + element.parentElement.offsetTop - element.parentElement.scrollTop}px`;
  clone.style.left = `${element.offsetLeft + element.parentElement.offsetLeft - element.parentElement.scrollLeft}px`;
  draggableParent.value.parentElement.appendChild(clone);
}

function toggleContainerScroll(enable) {
  if (enable) {
    containerScrollTimeout = setInterval(() => {
      if (currentPointerX === null || currentPointerY === null)
        return;

      const container = draggableParent.value,
        containerRect = container.getBoundingClientRect(),
        containerX1 = containerRect.left + window.scrollX,
        containerX2 = containerRect.left + window.scrollX + containerRect.width,
        containerY1 = containerRect.top,
        containerY2 = containerRect.top + containerRect.height,
        horizontalScrollDirection = currentPointerX < containerX1 + 0.1 * containerRect.width ? "left" : currentPointerX > containerX2 - 0.1 * containerRect.width ? "right" : null,
        verticalScrollDirection = currentPointerY < containerY1 + 0.1 * containerRect.height ? "up" : currentPointerY > containerY2 - 0.1 * containerRect.height ? "down" : null;

      if (!horizontalScrollDirection && !verticalScrollDirection
          || horizontalScrollDirection === "left" && container.scrollLeft < 1
            || horizontalScrollDirection === "right" && container.scrollLeft >= container.scrollWidth - containerRect.width
            || verticalScrollDirection === "up" && container.scrollTop < 1
            || verticalScrollDirection === "down" && container.scrollTop >= container.scrollHeight - containerRect.height)
        return;

      const scrollSpeedX = Math.round(Math.pow(1 + Math.abs(containerX1 + containerRect.width / 2 - currentPointerX) / 300, 3)),
        scrollSpeedY = Math.round(Math.pow(1 + Math.abs(containerY1 + containerRect.height / 2 - currentPointerY) / 300, 3));

      if (horizontalScrollDirection === "left") {
        container.scrollLeft -= scrollSpeedX;
      } else if (horizontalScrollDirection === "right") {
        container.scrollLeft += scrollSpeedX;
      }

      if (verticalScrollDirection === "up") {
        container.scrollTop -= scrollSpeedY;
      } else if (verticalScrollDirection === "down") {
        container.scrollTop += scrollSpeedY;
      }      
    }, 16.67);
  } else {
    clearInterval(containerScrollTimeout);
    currentPointerX = currentPointerY = null;
  }
}

function moveClone(currentX, currentY) {
  if (clone) {
    clone.style.transform = `translate(${currentX - originalPointerX}px, ${currentY - originalPointerY}px)`;
  }
}

function discardClone() {
  if (clone) {
    clone.remove();
    clone = null;
  }
}

function switchDraggable(draggable1Idx, draggable2Idx) {
  let tmp = props.gallery.images[draggable1Idx];
  props.gallery.images.splice(draggable1Idx, 1);
  props.gallery.images.splice(draggable2Idx, 0, tmp);

  tmp = draggableElements.value[draggable1Idx];
  draggableElements.value.splice(draggable1Idx, 1);
  draggableElements.value.splice(draggable2Idx, 0, tmp);

  tmp = reorderState[draggable1Idx];
  reorderState.splice(draggable1Idx, 1);
  reorderState.splice(draggable2Idx, 0, tmp);
}
/* /CMS */
</script>

<template>
<div v-if="showGalleryContainer" class="gallery-thumbs" :class="galleryThumbsClass" ref="draggableParent">
  <TransitionGroup name="image-list" @before-leave="onBeforeLeave">
    <div
      v-for="image, i in gallery.images"
      :key="image.originalName ? image.originalName : image.id"
      class="gallery-img-container"
      :data-draggable-class="draggableClass"
      ref="draggableElements"
      @mouseenter="onImgMouseEnter(image.src)"
      @mouseleave="onImgMouseLeave(image.src)"
      @mousedown="onDraggableElementMouseDown(i, $event)"
      @touchstart="onDraggableElementTouchStart(i, $event)"
      >
      <a
        v-bind:key="image.src"
        :href="image.src"
        :data-pswp-width="image.width"
        :data-pswp-height="image.height"
        :data-id="image.id"
        v-i18n-attr:[locale].title="image.caption"
        data-cropped="true"
        target="_blank"
        class="gallery-original-link"
        draggable="false"
        >
        <img
          :src="image.src"
          :srcset="image.srcset"
          :width="image.width"
          :height="image.height"
          :data-caption="image.caption || 'none'"
          v-i18n-attr:[locale].alt="image.caption"
          class="gallery-img"
          loading="lazy"
          draggable="false"
        />
      </a>

      <div class="gallery-img-overlay" :class="{ active: image.uploading }"></div>

      <!-- CMS -->
      <div class="gallery-img-controls" :class="{ expanded: imgControlsExpanded[image.src] }" v-if="cmsControlsStore.editMode">
        <CmsOptionsButton v-if="!imgControlsExpanded[image.src]" @click="imgControlsExpanded[image.src] = !imgControlsExpanded[image.src]" />

        <Transition name="expand-width">
          <div class="gallery-img-controls-actions" v-if="imgControlsExpanded[image.src]">
            <CmsButtonClose @click="imgControlsExpanded[image.src] = false" />
            <CmsButtonArrow v-if="i !== 0" @click="onMoveImage(image.id, 'prev')" direction="left" title="Swap with previous" />
            <CmsButtonArrow v-if="i !== gallery.images.length - 1" @click="onMoveImage(image.id, 'next')" direction="right" title="Swap with next" />
            <CmsButtonDelete @click="onImgDeleteClick(image.id)" deleteWhatText="image" />
          </div>
        </Transition>
        </div>
      <!-- /CMS -->
    </div>
  </TransitionGroup>

  <!-- CMS -->
  <div v-if="showNewGalleryImgButton" class="cms-new-gallery-image-outer">
    <CmsAdventureItemButtonNew class="cms-new-gallery-image-button" @click="nextGalleryImgInput.click()" size="small" />
    <input class="cms-new-gallery-image-input" type="file" @change="onChooseNextGalleryImages($event.target.files)" accept="image/jpeg,image/png,image/gif" multiple ref="nextGalleryImgInput">
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

.gallery-thumbs .gallery-img,
.draggable-clone .gallery-img {
    transition: transform 0.3s ease-out;
}

.gallery-thumbs .gallery-original-link,
.draggable-clone .gallery-original-link {
    overflow: hidden;
    display: block;
    border-radius: 8px;
}

.gallery-thumbs img,
.draggable-clone img {
  display: block;
  object-fit: cover;
}

.gallery-thumbs.row .gallery-img,
.draggable-clone.draggable-row-item .gallery-img {
  width: auto;
  height: 4rem;
}

.gallery-thumbs.grid .gallery-img,
.draggable-clone.draggable-grid-item .gallery-img {
  width: 4rem;
  height: 4rem;
}

@media (orientation: landscape) {
  .gallery-thumbs.grid {
    display: flex;
    max-width: 8.5rem;
    overflow: hidden;
    align-self: center;
    flex-wrap: wrap;
    justify-content: center;
  }

  @media (min-height: 501px) {
    .gallery-thumbs.grid {
      margin-top: 0;
    }
  }
  
  @media (min-height: 600px) {
    .gallery-thumbs.row {
      padding-bottom: 5px;
    }

    .gallery-thumbs.grid {
      max-width: 12.5rem;
    }
  
    .gallery-thumbs.grid .gallery-img,
    .draggable-clone.draggable-grid-item .gallery-img {
      width: 6rem;
      height: 6rem;
    }    

    .gallery-thumbs.row .gallery-img,
    .draggable-clone.draggable-row-item .gallery-img {
      height: 6rem;
    }  
  }
}

@media (orientation: portrait) {
  .gallery-thumbs.grid .gallery-img,
  .draggable-clone.draggable-grid-item .gallery-img {
    width: auto;
    height: 4rem;
  }
  
  @media (min-height: 768px) {
    .gallery-thumbs.grid {
      display: flex;
      overflow: hidden;
      align-self: center;
      max-width: 12.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .gallery-thumbs.row {
      padding-bottom: 10px;
    }

    .gallery-thumbs.grid .gallery-img,
    .draggable-clone.draggable-grid-item .gallery-img {
      width: 6rem;
      height: 6rem;
    }

    .gallery-thumbs.row .gallery-img,
    .draggable-clone.draggable-row-item .gallery-img {
      height: 6rem;
    }    
  }
}


/* CMS */
.gallery-thumbs .gallery-img-container,
.draggable-clone .gallery-img-container {
  position: relative;
}
.gallery-thumbs .gallery-img-container.dragging {
  opacity: 0.01;
}

.gallery-thumbs .gallery-img-controls,
.draggable-clone .gallery-img-controls {
  position: absolute;
  top: 0;
  left: 0;
  width: 1.5rem;
  overflow-x: hidden;
  background: rgba(0, 0, 0, 0.68);
  color: white;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  padding: 0.2rem;
  display: flex;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0.5rem;
  transition-property: width, border-top-right-radius, border-bottom-right-radius;
  transition-duration: 0.15s;
  transition-timing-function: ease-out;
}

.gallery-thumbs .gallery-img-controls.expanded {
  width: calc(100% - 0.2rem * 2);
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0;
}

.gallery-thumbs .gallery-img-controls .gallery-img-controls-actions,
.draggable-clone .gallery-img-controls .gallery-img-controls-actions {
  width: max-content;
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

.gallery-thumbs .gallery-img-controls button,
.draggable-clone .gallery-img-controls button {
  width: 1.5rem;
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-thumbs .gallery-img-controls button svg,
.draggable-clone .gallery-img-controls button svg {
  fill: white;
}

.gallery-thumbs .gallery-img-controls .button-options {
  transition: width, 0.15s ease-out;
}

.gallery-thumbs .gallery-img-controls .button-close-container,
.draggable-clone .gallery-img-controls .button-close-container {
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

.gallery-thumbs .gallery-img-overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition-property: backdrop-filter, -webkit-backdrop-filter;
  transition-duration: 0.3s;
  transition-timing-function: ease;
  pointer-events: none;
}

.gallery-thumbs .gallery-img-overlay.active {
  backdrop-filter: saturate(0) brightness(1.5) blur(1px);
  -webkit-backdrop-filter: saturate(0) brightness(1.5) blur(1px);
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