<script>
import AdventureGallerySlide from "./adventure-slides/AdventureGallerySlide.vue";
import AdventureIntroSlide from "./adventure-slides/AdventureIntroSlide.vue";
</script>

<script setup>
const props = defineProps({
  slide: {
    type: Object,
    required: true,
  },
  slideIdx: {
    type: Number,
    required: true,
  },
});
</script>

<template>
  <AdventureIntroSlide v-if="slide.intro" :slide="slide" :slideIdx="slideIdx" />
  <AdventureGallerySlide v-else :slide="slide" :slideIdx="slideIdx" />
</template>
