<script setup>
defineProps({
    id: {
        type: String,
        required: true
    },
    gallery: {
        type: Array,
        required: true
    }
});
</script>

<template>
<div :id="id" class="gallery-thumbs">
    <a
        v-for="image in gallery"
        v-bind:key="image.src"
        :href="image.imgAttrs.src"
        v-bind="image.pswpImgAttrs"
        target="_blank"
    >
        <img v-bind="image.imgAttrs" loading="lazy" />
    </a>
</div>
</template>

<style>
.gallery-thumbs {
  display: flex;
  overflow-x: scroll;
}

@media (min-width: 768px) {
  .gallery-thumbs {
    max-width: 30rem;
  }
}

.gallery-thumbs img {
  height: 6rem;
  width: auto;
}

@media (min-width: 800px) {
  .gallery-thumbs {
    scrollbar-color: rgba(250, 250, 250, 0.8) transparent; /* Firefox */
  }

  .gallery-thumbs::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  
  .gallery-thumbs::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0);
  }
  
  .gallery-thumbs::-webkit-scrollbar-thumb {
    background: rgba(250, 250, 250, 0.8); /* Chrome etc. */
    border-radius: 4px;
  }

  .gallery-thumbs::-webkit-scrollbar-thumb:hover {
    background: rgb(85, 85, 85);
  }
}

.gallery-thumbs img {
  object-fit: cover;
  margin: 0 0.25rem;
  border-radius: 8px;
}

.gallery-thumbs a:nth-child(1) img {
  margin-left: 0;
}

.gallery-thumbs a:nth-last-child(1) img {
  margin-right: 0;
}
</style>