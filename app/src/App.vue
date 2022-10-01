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

// Static assets
import day1jpg from "./assets/img/day1.jpg";
import day1_1jpg from "./assets/img/day1_1.jpg";
import day1_2jpg from "./assets/img/day1_2.jpg";
import day1_3jpg from "./assets/img/day1_3.jpg";
import day1_4jpg from "./assets/img/day1_4.jpg";
import day1_5jpg from "./assets/img/day1_5.jpg";
import day1_6jpg from "./assets/img/day1_6.jpg";
import day1_7jpg from "./assets/img/day1_7.jpg";
import day2jpg from "./assets/img/day2.jpg";
import day3jpg from "./assets/img/day3.jpg";
import day4jpg from "./assets/img/day4.jpg";

window.gsap = gsap;

const slides = [
  {
    id: "day1",
    mainImg: day1jpg,
    pswpMainImgAttrs: {
      "data-pswp-width": 4032,
      "data-pswp-height": 3024,
      "data-cropped": true,
    },
    transition: 2,
    headline: "Niedersachsenhaus",
    content:
      "Am Donnerstag haben wir uns vorgenommen zum Nie&shy;der&shy;sach&shy;sen&shy;haus aufzusteigen. Der Gipfel war auf ugf. 2400 metern und wir hatten über 1000 Hm zu überwinden. Es war am Ende eine sehr schöne Wanderung, wir haben viel gesehen.",
    gallery: [
      {
        imgAttrs: {
          src: day1_1jpg,
          alt: "Day 1 (1)",
          width: 150,
          height: 100,
        },
        pswpImgAttrs: {
          "data-pswp-width": 4032,
          "data-pswp-height": 3024,
          "data-cropped": true,
        },
      },
      {
        imgAttrs: {
          src: day1_2jpg,
          alt: "Day 1 (2)",
          width: 66,
          height: 100,
        },
        pswpImgAttrs: {
          "data-pswp-width": 3024,
          "data-pswp-height": 4032,
          "data-cropped": true,
        },
      },
      {
        imgAttrs: {
          src: day1_3jpg,
          alt: "Day 1 (3)",
          width: 150,
          height: 100,
        },
        pswpImgAttrs: {
          "data-pswp-width": 4032,
          "data-pswp-height": 3024,
          "data-cropped": true,
        },
      },
      {
        imgAttrs: {
          src: day1_4jpg,
          alt: "Day 1 (4)",
          width: 250,
          height: 100,
        },
        pswpImgAttrs: {
          "data-pswp-width": 5966,
          "data-pswp-height": 1683,
          "data-cropped": true,
        },
      },
      {
        imgAttrs: {
          src: day1_5jpg,
          alt: "Day 1 (5)",
          width: 66,
          height: 100,
        },
        pswpImgAttrs: {
          "data-pswp-width": 3024,
          "data-pswp-height": 4032,
          "data-cropped": true,
        },
      },
      {
        imgAttrs: {
          src: day1_6jpg,
          alt: "Day 1 (6)",
          width: 150,
          height: 100,
        },
        pswpImgAttrs: {
          "data-pswp-width": 4032,
          "data-pswp-height": 3024,
          "data-cropped": true,
        },
      },
      {
        imgAttrs: {
          src: day1_7jpg,
          alt: "Day 1 (7)",
          width: 66,
          height: 100,
        },
        pswpImgAttrs: {
          "data-pswp-width": 3024,
          "data-pswp-height": 4032,
          "data-cropped": true,
        },
      },
    ],
  },
  {
    id: "day2",
    mainImg: day2jpg,
    pswpMainImgAttrs: {
      "data-pswp-width": 4032,
      "data-pswp-height": 3024,
      "data-cropped": true,
    },
    transition: 1,
    headline: "Day 2",
    content: "Das ist der <b>Testcontent</b> für day2.",
  },
  {
    id: "day3",
    mainImg: day3jpg,
    pswpMainImgAttrs: {
      "data-pswp-width": 4032,
      "data-pswp-height": 3024,
      "data-cropped": true,
    },
    transition: 0,
    headline: "Day 3",
    content: "Das ist der <b>Testcontent</b> für day3.",
  },
  {
    id: "day4",
    mainImg: day4jpg,
    pswpMainImgAttrs: {
      "data-pswp-width": 4032,
      "data-pswp-height": 3024,
      "data-cropped": true,
    },
    transition: 1,
    headline: "Day 4",
    content: "Das ist der <b>Testcontent</b> für day4.",
  },
];

onMounted(() => {
  const slides = document.querySelectorAll("section");

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

  window.photoswipes = [];

  for (let slide of slides) {
    let pswpInstance = new PhotoSwipeLightbox({
      gallery: "#" + slide.id,
      children: "a",
      pswpModule: () => import("photoswipe"),
    });

    pswpInstance.init();

    window.photoswipes.push(pswpInstance);
  }
  console.log("mounted finished");
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
