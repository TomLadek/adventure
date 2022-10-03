<script>
import { onMounted, computed } from "vue";

import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

function getCssUrlString(url) {
  return `url(${url})`;
}
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

const mainImgUrlXs = computed(() => getCssUrlString(props.slide.mainImg.xs));
const mainImgUrlSm = computed(() => getCssUrlString(props.slide.mainImg.sm));
const mainImgUrlMd = computed(() => getCssUrlString(props.slide.mainImg.md));
const mainImgUrlLg = computed(() => getCssUrlString(props.slide.mainImg.lg));
const mainImgUrlXl = computed(() => getCssUrlString(props.slide.mainImg.xl));
const mainImgUrlXxl = computed(() => getCssUrlString(props.slide.mainImg.xxl));
const mainImgUrlXxxl = computed(() => getCssUrlString(props.slide.mainImg.xxxl));
const mainImgUrlXxxxl = computed(() => getCssUrlString(props.slide.mainImg.xxxxl));

onMounted(() => {
  // Init photoswipe
  let pswpInstance = new PhotoSwipeLightbox({
    gallery: "#" + props.slide.id,
    children: "a",
    pswpModule: () => import("photoswipe"),
  });

  pswpInstance.on("change", () => {
    // Scroll the thumbnail so that it's visible in its container
    pswpInstance.pswp.currSlide.data.element.scrollIntoView({behavior: "smooth", block: "nearest"});
  });

  pswpInstance.on("beforeOpen", () => {
    // Make sure scrolling doesn't trigger full page scroll's slide change
    window.fs.removeEvents();
  });

  pswpInstance.on("destroy", () => {
    // Re-enable full page scroll events
    window.fs.addEvents();
  });

  pswpInstance.init();

  window.photoswipes.push(pswpInstance);
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
      :href="slide.mainImg.original"
      v-bind="slide.pswpMainImgAttrs"
      target="_blank"
      class="main-picture"
    ></a>
    <div class="slide-content" :class="slide.content.position">
      <h2>{{ slide.headline }}</h2>
      <div :class="'content' + slideIdx">
        <p v-html="slide.content.text"></p>
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
          <img v-bind="image.imgAttrs" loading="lazy" />
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
  background-size: cover;
  background-position: center center;
}

@media (max-resolution: 149dpi) {
  @media (orientation: landscape) and (max-width: 575px) {
    .slide { background-image: v-bind(mainImgUrlXs); }
  }
  @media (orientation: landscape) and (min-width: 576px) {
    .slide { background-image: v-bind(mainImgUrlSm); }
  }
  @media (orientation: landscape) and (min-width: 768px) {
    .slide { background-image: v-bind(mainImgUrlMd); }
  }
  @media (orientation: landscape) and (min-width: 992px) {
    .slide { background-image: v-bind(mainImgUrlLg); }
  }
  @media (orientation: landscape) and (min-width: 1200px) {
    .slide { background-image: v-bind(mainImgUrlXl); }
  }
  @media (orientation: landscape) and (min-width: 1400px) {
    .slide { background-image: v-bind(mainImgUrlXxl); }
  }
  @media (orientation: landscape) and (min-width: 1600px) {
    .slide { background-image: v-bind(mainImgUrlXxxl); }
  }
  @media (orientation: landscape) and (min-width: 1920px) {
    .slide { background-image: v-bind(mainImgUrlXxxxl); }
  }

  @media (orientation: portrait) and (max-height: 432px) {
    .slide { background-image: v-bind(mainImgUrlXs); }
  }
  @media (orientation: portrait) and (min-height: 576px) {
    .slide { background-image: v-bind(mainImgUrlSm); }
  }
  @media (orientation: portrait) and (min-height: 744px) {
    .slide { background-image: v-bind(mainImgUrlMd); }
  }
  @media (orientation: portrait) and (min-height: 900px) {
    .slide { background-image: v-bind(mainImgUrlXl); }
  }
  @media (orientation: portrait) and (min-height: 1050px) {
  .slide { background-image: v-bind(mainImgUrlXxl); }
  }
  @media (orientation: portrait) and (min-height: 1200px) {
    .slide { background-image: v-bind(mainImgUrlXxxl); }
  }
  @media (orientation: portrait) and (min-height: 1440px) {
    .slide { background-image: v-bind(mainImgUrlXxxxl); }
  }
}

@media (min-resolution: 150dpi) {
  @media (orientation: landscape) and (max-width: 575px) {
    .slide { background-image: v-bind(mainImgUrlMd); }
  }
  @media (orientation: landscape) and (min-width: 576px) {
    .slide { background-image: v-bind(mainImgUrlLg); }
  }
  @media (orientation: landscape) and (min-width: 768px) {
    .slide { background-image: v-bind(mainImgUrlXl); }
  }
  @media (orientation: landscape) and (min-width: 992px) {
    .slide { background-image: v-bind(mainImgUrlXxxl); }
  }
  @media (orientation: landscape) and (min-width: 1200px) {
    .slide { background-image: v-bind(mainImgUrlXxxxl); }
  }

  @media (orientation: portrait) and (max-height: 216px) {
    .slide { background-image: v-bind(mainImgUrlXs); }
  }
  @media (orientation: portrait) and (min-height: 288px) {
    .slide { background-image: v-bind(mainImgUrlSm); }
  }
  @media (orientation: portrait) and (min-height: 372px) {
    .slide { background-image: v-bind(mainImgUrlMd); }
  }
  @media (orientation: portrait) and (min-height: 450px) {
    .slide { background-image: v-bind(mainImgUrlXl); }
  }
  @media (orientation: portrait) and (min-height: 525px) {
  .slide { background-image: v-bind(mainImgUrlXxl); }
  }
  @media (orientation: portrait) and (min-height: 600px) {
    .slide { background-image: v-bind(mainImgUrlXxxl); }
  }
  @media (orientation: portrait) and (min-height: 825px) {
    .slide { background-image: v-bind(mainImgUrlXxxxl); }
  }
}

.main-picture {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.slide-content p {
  text-align: justify;
}

.slide-content {
  margin: 3rem 0;
  max-width: 75vw;
  padding: 2rem;
  border-radius: 24px;
  
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px) grayscale(0.5);
}

.slide-content.top, .slide-content.bottom, .slide-content.start, .slide-content.end {
  position: relative;
}

.slide-content.top {
  align-self: flex-start;
}

.slide-content.bottom {
  align-self: flex-end;
}

@media (min-width: 768px) {
  .slide-content {
    max-width: 30rem;
    align-self: unset;
    margin: 0;
    padding: 3rem;
    border-radius: 48px;
  }
  
  .slide-content.top, .slide-content.bottom, .slide-content.start, .slide-content.end {
    position: absolute;
  }

  .slide-content.top {
    top: 3rem;
  }

  .slide-content.bottom {
    bottom: 3rem;
  }

  .slide-content.start {
    left: 3rem;
  }

  .slide-content.end {
    right: 3rem;
  }
}

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
