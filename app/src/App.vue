<script>
// Vue functions
import { onMounted } from "vue";

// Vue components
import AdventureSlide from "./components/AdventureSlide.vue";

// Custom libraries
import { gsap } from "gsap";
import "./assets/gi-full-page-scroll.js";
import "./assets/gi-full-page-scroll.css";

// Data
import slidesData from "./assets/data/slides.js";

window.photoswipes = [];
window.gsap = gsap;

function imageUrl(image, width = 0, height = 0) {
  const sizeSuffix = width != 0 || height != 0 ? `_${width}x${height}` : "";

  return new URL(`./assets/data/img/${image}${sizeSuffix}.jpg`, import.meta.url).href;
}

function imageSizes(image) {
  return [
    {size: "original", width: 0},
    {size: "xs", width: 576},
    {size: "sm", width: 768},
    {size: "md", width: 992},
    {size: "lg", width: 1200},
    {size: "xl", width: 1400},
    {size: "xxl", width: 1600},
    {size: "xxxl", width: 1920},
    {size: "xxxxl", width: 2200}
  ].reduce((prev, curr) => {
    prev[curr.size] = imageUrl(image, curr.width); return prev;
  }, {});
}

function gallerySrc(image, height = 96) {
  return imageUrl(image, 0, height);
}

function gallerySrcSet(image, baseHeight = 96) {
  let heights;

  if (baseHeight === 96)
    heights = ["96", "192", "288"];

  return heights
          .map((size, i) => `${gallerySrc(image, size)} ${i + 1}x`)
          .join(",");
}

const slides = slidesData.map((slide) => {
  slide.pswpMainImgAttrs = {
    "data-pswp-width": slide.mainImg.width,
    "data-pswp-height": slide.mainImg.height,
    "data-cropped": true,
  };
  slide.mainImg = imageSizes(slide.mainImg.src);

  if (slide.gallery) {
    slide.gallery = slide.gallery.map((galleryImg) => {
      galleryImg.imgAttrs = {
        src: gallerySrc(galleryImg.src, 0),
        srcset: gallerySrcSet(galleryImg.src),
        alt: galleryImg.caption,
        width: galleryImg.width,
        height: galleryImg.height
      };
      galleryImg.pswpImgAttrs = {
        "data-pswp-width": galleryImg.width,
        "data-pswp-height": galleryImg.height
      };

      delete galleryImg.caption;
      delete galleryImg.width;
      delete galleryImg.height;

      return galleryImg;
    });
  }

  return slide;
});
</script>

<script setup>
onMounted(() => {
  const slides = document.querySelectorAll("section");

  // Init full page scroll
  window.fs = new window.fullScroll({
    mainElement: "main",
    sections: slides,
    sectionTransitions: (() => {
      const transitionSlides = [];

      slides.forEach((slide) => {
        let slideTransition = slide.dataset.slidetransition;

        if (/\d+/.test(slideTransition))
          slideTransition = parseInt(slideTransition);
        else slideTransition = 0;

        transitionSlides.push(slideTransition);
      });

      return transitionSlides;
    })(),
  });
});
</script>

<template>
  <main id="main">
    <AdventureSlide
      v-for="(s, i) in slides"
      v-bind:key="s.id"
      :slide="s"
      :slideIdx="i"
    />
  </main>
</template>
