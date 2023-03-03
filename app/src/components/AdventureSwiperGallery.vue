<script>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { getCaptionText } from "../utils.js";
</script>

<script setup>
const props = defineProps({
  gallery: {
    type: Object,
    required: true
  }
});

const { t } = useI18n();

const galleryThumbsClass = computed(() => {
  const baseClass = {
    row: typeof props.gallery.style === "undefined"
  }

  if (props.gallery.style)
    baseClass[props.gallery.style] = true;

  return baseClass;
});
</script>

<template>
<div class="gallery-thumbs" :class="galleryThumbsClass">
  <a
    v-for="image in gallery.images"
    v-bind:key="image.src"
    :href="image.imgAttrs.src"
    :title="image.title && getCaptionText(t(image.title))"
    v-bind="image.pswpImgAttrs"
    target="_blank"
  >
    <img
      v-bind="image.imgAttrs" 
      :alt="image.alt && getCaptionText(t(image.alt))"
      :data-caption="t(image.title ?? '[error in AdventureSwiperGallery.vue]')"
      loading="lazy"
    />
  </a>
</div>
</template>

<style>

.gallery-thumbs.row {
  display: flex;
  gap: 0.5rem;
  margin: 0 auto;
  max-width: 100%;
  min-height: calc(6rem + 10px);
  overflow-x: scroll;
}

@media (orientation: landscape) and (max-height: 500px) {
  .gallery-thumbs.row {
    min-height: calc(4rem + 10px);
  }
}

.gallery-thumbs.grid {
  display: grid;
  grid-template-columns: repeat(2, 6rem);
  grid-template-rows: repeat(2, 6rem);
  row-gap: 0.5rem;
  column-gap: 0.5rem;
  align-self: center;
}

@media (orientation: landscape) and (max-height: 500px) {
  .gallery-thumbs.grid {
    grid-template-columns: repeat(2, 4rem);
    grid-template-rows: repeat(2, 4rem);
  }
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
  height: 6rem;
  width: auto;
}

.gallery-thumbs.grid img {
  height: 6rem;
  width: 6rem;
}

@media (orientation: landscape) and (max-height: 500px) {
  .gallery-thumbs.row img {
    height: 4rem;
  }

  .gallery-thumbs.grid img {
    height: 4rem;
    width: 4rem;
  }
}
</style>