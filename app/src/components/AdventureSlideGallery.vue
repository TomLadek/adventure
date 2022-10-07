<script>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
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
    :title="image.title && t(image.title)"
    v-bind="image.pswpImgAttrs"
    target="_blank"
  >
    <img
      v-bind="image.imgAttrs" 
      :alt="image.alt && t(image.alt)"
      loading="lazy"
    />
  </a>
</div>
</template>

<style>
.gallery-thumbs {
  overflow-y: hidden;
}

.gallery-thumbs.row {
  display: flex;
  gap: 0.5rem;
  min-height: 6rem;
  overflow-x: scroll;
}

.gallery-thumbs.grid {
  display: grid;
  grid-template-columns: repeat(2, 6rem);
  grid-template-rows: repeat(2, 6rem);
  row-gap: 0.5rem;
  column-gap: 0.5rem;
  align-self: center;
}

@media (min-width: 768px) {
  .gallery-thumbs {
    max-width: 30rem;
  }
}

.gallery-thumbs img {
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

@media (min-width: 800px) {
  .gallery-thumbs.row {
    scrollbar-color: rgba(250, 250, 250, 0.8) transparent; /* Firefox */
  }

  .gallery-thumbs.row::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  
  .gallery-thumbs.row::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0);
  }
  
  .gallery-thumbs.row::-webkit-scrollbar-thumb {
    background: rgba(250, 250, 250, 0.8); /* Chrome etc. */
    border-radius: 4px;
  }

  .gallery-thumbs.row::-webkit-scrollbar-thumb:hover {
    background: rgb(85, 85, 85);
  }
}
</style>