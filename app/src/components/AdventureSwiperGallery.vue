<script>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { getCaptionText } from "../../src/utils.js";

/* CMS */
import { useCmsControlsStore } from "../stores/cmscontrols.js";
/* /CMS */
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

/* CMS */
const cmsControlsStore = useCmsControlsStore();

const cmsImgBorder = computed(() => {

  if (cmsControlsStore.editMode)
    return "1px solid red";
  else
    return "none";
})
/* /CMS */
</script>

<template>
<div class="gallery-thumbs" :class="galleryThumbsClass">
  <a
    v-for="image in gallery.images"
    v-bind:key="image.src"
    :href="image.src"
    :title="image.caption && getCaptionText(t(image.caption))"
    :data-pswp-width="image.width"
    :data-pswp-height="image.height"
    data-cropped="true"
    target="_blank"
  >
    <img
      :src="image.src"
      :srcset="image.srcset"
      :width="image.width"
      :height="image.height"
      :alt="image.caption && getCaptionText(t(image.caption))"
      :data-caption="image.caption"
      loading="lazy"
    />
  </a>
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
.gallery-thumbs img {
  box-sizing: border-box;
  border: v-bind(cmsImgBorder);
}
/* /CMS */
</style>