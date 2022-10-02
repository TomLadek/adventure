<script setup>
// Vue functions
import { onMounted } from "vue";

// Vue components
import AdventureSlide from "./components/AdventureSlide.vue";

// Custom libraries
import { gsap } from "gsap";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import "./assets/gi-full-page-scroll.js";
import "./assets/gi-full-page-scroll.css";

window.photoswipes = [];
window.gsap = gsap;

function imageUrl(image, width = 0, height = 0) {
  const sizeSuffix = width != 0 || height != 0 ? `_${width}x${height}` : "";

  return new URL(`./assets/img/${image}${sizeSuffix}.jpg`, import.meta.url).href;
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

const slides = [
  {
    id: "day1",
    mainImg: imageSizes("day1"),
    pswpMainImgAttrs: {
      "data-pswp-width": 4032,
      "data-pswp-height": 3024,
      "data-cropped": true,
    },
    transition: 2,
    headline: "Niedersachsenhaus",
    content: {
      text: "Am Donnerstag haben wir uns vorgenommen zum Nie&shy;der&shy;sach&shy;sen&shy;haus aufzusteigen. Der Gipfel war auf ugf. 2400 metern und wir hatten über 1000 Hm zu überwinden. Es war am Ende eine sehr schöne Wanderung, wir haben viel gesehen.",
      position: "bottom end"
    },
    gallery: [
      {
        imgAttrs: {
          src: gallerySrc("gallery1-1", 0),
          srcset: gallerySrcSet("gallery1-1"),
          alt: "Day 1 (1)",
          width: 4032,
          height: 3024
        },
        pswpImgAttrs: {
          "data-pswp-width": 4032,
          "data-pswp-height": 3024
        },
      },
      {
        imgAttrs: {
          src: gallerySrc("gallery1-2", 0),
          srcset: gallerySrcSet("gallery1-2"),
          alt: "Day 1 (2)",
          width: 3024,
          height: 4032,
        },
        pswpImgAttrs: {
          "data-pswp-width": 3024,
          "data-pswp-height": 4032
        },
      },
      {
        imgAttrs: {
          src: gallerySrc("gallery1-3", 0),
          srcset: gallerySrcSet("gallery1-3"),
          alt: "Day 1 (3)",
          width: 4032,
          height: 3024,
        },
        pswpImgAttrs: {
          "data-pswp-width": 4032,
          "data-pswp-height": 3024
        },
      },
      {
        imgAttrs: {
          src: gallerySrc("gallery1-4", 0),
          srcset: gallerySrcSet("gallery1-4"),
          alt: "Day 1 (4)",
          width: 5966,
          height: 1683,
        },
        pswpImgAttrs: {
          "data-pswp-width": 5966,
          "data-pswp-height": 1683
        },
      },
      {
        imgAttrs: {
          src: gallerySrc("gallery1-5", 0),
          srcset: gallerySrcSet("gallery1-5"),
          alt: "Day 1 (5)",
          width: 3024,
          height: 4032,
        },
        pswpImgAttrs: {
          "data-pswp-width": 3024,
          "data-pswp-height": 4032
        },
      },
      {
        imgAttrs: {
          src: gallerySrc("gallery1-6", 0),
          srcset: gallerySrcSet("gallery1-6"),
          alt: "Day 1 (6)",
          width: 4032,
          height: 3024,
        },
        pswpImgAttrs: {
          "data-pswp-width": 4032,
          "data-pswp-height": 3024
        },
      },
      {
        imgAttrs: {
          src: gallerySrc("gallery1-7", 0),
          srcset: gallerySrcSet("gallery1-7"),
          alt: "Day 1 (7)",
          width: 3024,
          height: 4032,
        },
        pswpImgAttrs: {
          "data-pswp-width": 3024,
          "data-pswp-height": 4032
        },
      },
    ],
  },
  {
    id: "day2",
    mainImg: imageSizes("day2"),
    pswpMainImgAttrs: {
      "data-pswp-width": 4032,
      "data-pswp-height": 3024,
      "data-cropped": true,
    },
    transition: 1,
    headline: "Day 2",
    content: {
      text: "Das ist der <b>Testcontent</b> für day2.",
      position: "bottom start"
    },
  },
  {
    id: "day3",
    mainImg: imageSizes("day3"),
    pswpMainImgAttrs: {
      "data-pswp-width": 4032,
      "data-pswp-height": 3024,
      "data-cropped": true,
    },
    transition: 0,
    headline: "Day 3",
    content: {
      text: "Das ist der <b>Testcontent</b> für day3.",
      position: "top end"
    },
  },
  {
    id: "day4",
    mainImg: imageSizes("day4"),
    pswpMainImgAttrs: {
      "data-pswp-width": 4032,
      "data-pswp-height": 3024,
      "data-cropped": true,
    },
    transition: 1,
    headline: "Day 4",
    content: {
      text: "Das ist der <b>Testcontent</b> für day4.",
      position: "top start"
  },
  },
];

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


  // Init photoswipe
  for (let slide of slides) {
    let pswpInstance = new PhotoSwipeLightbox({
      gallery: "#" + slide.id,
      children: "a",
      pswpModule: () => import("photoswipe"),
    });

    pswpInstance.init();

    window.photoswipes.push(pswpInstance);
  }
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
