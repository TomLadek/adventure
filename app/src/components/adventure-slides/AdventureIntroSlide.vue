<script>
import { useI18n } from "vue-i18n";
import { ref, onMounted, computed, watch } from "vue";
</script>

<script setup>
const props = defineProps({
  slide: {
    type: Object,
    required: true
  },
  showing: {
    type: Boolean,
    required: true
  }
});

const { t } = useI18n();

const startLinkHasSpace = ref(false);

const startLinkClass = computed(() => {
  return {
    "start-link": true,
    cornered: !startLinkHasSpace.value
  }
});

let startLinkElement,

  startLinkAnimation = gsap.timeline({
    delay: 4,
    repeat: -1,
    repeatDelay: 2
  });

onMounted(() => {
  startLinkElement = document.querySelector(".slide-intro .start-link");

  const contentOuterElement = document.querySelector(".slide-intro .content-outer"),
    checkStartLinkSpace = () => 0 <
      (window.innerHeight - contentOuterElement.clientHeight) / 2 /* remaining space below the actual slide content */
      - (matchMedia("(orientation: landscape) and (max-height: 500px)").matches ? 16 : 48) /* link's distance from the bottom */
      - (startLinkElement.clientHeight) /* height of the link */;

  startLinkAnimation.to(startLinkElement, { y: "-10" });
  startLinkAnimation.to(startLinkElement, { y: "0", ease: "elastic", duration: 1.7 });

  startLinkHasSpace.value = checkStartLinkSpace();

  window.addEventListener("resize", () => {
    startLinkHasSpace.value = checkStartLinkSpace();
  });
});

watch(() => props.showing, (showing) => {
  // perform one time actions when this slide stops showing
  if (!showing) {
    if (startLinkAnimation) {
      startLinkAnimation.revert();
      startLinkAnimation = null;
    }

    if (startLinkElement && startLinkElement.style.opacity !== 0) {
      startLinkElement.style.opacity = 0;
    }
  }
});
</script>

<template>
  <section
    :id="slide.id"
    class="slide slide-intro"
  >
    <span
      v-if="slide.mainImg"
      class="main-picture"
    ></span>

    <div class="content-outer">
      <h1 class="headline">
        <span v-html="t(slide.headline)"></span>
        <span class="subheadline" v-html="t(slide.subheadline)"></span>
      </h1>

      <div class="content-inner">
        <div class="text-wrapper">
          <p v-html="t(slide.content.text)"></p>
        </div>
  
      </div>
    </div>

    <a href="#slide1" :class="startLinkClass">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="22" viewBox="0 0 35 22" class="start-link-icon">
        <path d="M4,4 L18,18 L32,4" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    </a>
  </section>
</template>

<style>
.slide-intro .main-picture {
  z-index: -1;
}

.slide-intro .headline {
  font-size: min(min(18vw, 8em), 12vh);
  text-align: center;
  text-shadow: 3px 3px 2px #272727;
  margin: max(2rem, 6vh) 0;
  transition: text-shadow var(--default-anim-time) ease;
}

@media (min-width: 768px) {
  .slide-intro .headline {
    font-size: 8em;
  }
}

.dark .slide-intro .headline {
  text-shadow: 3px 3px 2px #ececec75;
}

@media (orientation: landscape) and (max-height: 500px) {
  .slide-intro .headline {
    font-size: min(min(18vw, 8em), 18vh);
  }
}

.slide-intro .subheadline {
  display: block;
  font-size: 40%;
}

.slide-intro .content-outer {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  color: white;
  transition: color var(--default-anim-time) ease;
}

.dark .slide-intro .content-outer {
  color: var(--color-black);
}

.slide-intro .content-outer p {
  text-align: center;
  hyphens: auto;
}

.slide-intro .content-inner {
  margin: 0 1rem;
  max-width: 75vw;
  padding: 1rem;
  border-radius: 20px;
  box-shadow: 0 0 5px 0 rgb(0 0 0 / 45%);
  backdrop-filter: blur(10px) grayscale(0.5);
}

.slide-intro .text-wrapper {
  font-size: 1.5rem;
}

@media (orientation: landscape) and (max-height: 500px) {
  .slide-intro .text-wrapper {
    font-size: min(min(10vw, 1.5rem), 6vh);
  }
}

.slide-intro .start-link {
  position: absolute;
  bottom: 48px;
  transition: opacity var(--default-anim-time) ease;
}

.slide-intro .start-link.cornered {
  bottom: 16px;
  right: 16px;
}

.slide-intro .start-link.cornered svg {
  width: 30px;
}

@media (orientation: landscape) and (max-height: 500px) {
  .slide-intro .start-link {
    bottom: 16px;
  }
}

.slide-intro .start-link-icon path {
  stroke: white;
  transition: stroke var(--default-anim-time) ease;
}

.dark .slide-intro .start-link-icon path {
  stroke: var(--color-black);
}
</style>
