<script setup>
import { computed } from "vue";

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

const mainImgUrl = computed(() => {
  return "url(" + props.slide.mainImg + ")";
});
</script>

<template>
  <section
    :id="slide.id"
    :data-slidetransition="slide.transition"
    class="slide"
  >
    <a
      v-if="slide.mainImg"
      :href="slide.mainImg"
      v-bind="slide.pswpMainImgAttrs"
      target="_blank"
      class="main-picture"
    ></a>
    <div class="slide-content">
      <h2>{{ slide.headline }}</h2>
      <div :class="'content' + slideIdx">
        <p v-html="slide.content"></p>
      </div>
      <div
        v-if="slide.gallery"
        :id="slide.id + '-gallery'"
        class="gallery-thumbs"
      >
        <a
          v-for="image in slide.gallery"
          v-bind:key="image.src"
          :href="image.imgAttrs.src"
          v-bind="image.pswpImgAttrs"
          target="_blank"
        >
          <img v-bind="image.imgAttrs" />
        </a>
      </div>
    </div>
  </section>
</template>

<style>
.slide {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 100vh;
  background-image: v-bind(mainImgUrl);
  background-size: cover;
  background-position: center center;
}

.main-picture {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.slide-content {
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.45);
  max-width: 30rem;
  padding: 3rem;
  backdrop-filter: blur(10px) grayscale(0.5);
  border-radius: 3rem;
  position: absolute;
  right: 3rem;
  bottom: 3rem;
}

.slide-content p {
  text-align: justify;
}

.gallery-thumbs {
  display: flex;
  max-width: 30rem;
  overflow-x: scroll;
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
