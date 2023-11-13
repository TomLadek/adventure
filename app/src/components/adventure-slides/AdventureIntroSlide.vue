<script>
import { useI18n } from "vue-i18n";
import { ref, onMounted, computed, watch } from "vue";
</script>

<script setup>
const props = defineProps({
  author: {
    type: Object,
    required: false
  },
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
  startLinkAnimation,
  infoShowing = ref(false);

onMounted(() => {
  startLinkElement = document.querySelector(".slide-intro .start-link");

  startLinkAnimation = startLinkElement.animate([
    { transform: 'translateY(0)', easing: "linear" },
    { transform: 'translateY(-4px)', easing: "cubic-bezier(0.15, 0.4, 0.68, 1.55)", offset: 0.1 },
    { transform: 'translateY(15px)', easing: "cubic-bezier(0.15, 0.4, 0.68, 1.55)", offset: 0.25 },
    { transform: 'translateY(0)', offset: 0.4 }
  ], {
    duration: 4200,
    iterations: Infinity,
    delay: 3000
  });

  const contentOuterElement = document.querySelector(".slide-intro .content-outer"),
    checkStartLinkSpace = () => 0 <
      (window.innerHeight - contentOuterElement.clientHeight) / 2 /* remaining space below the actual slide content */
      - (matchMedia("(orientation: landscape) and (max-height: 500px)").matches ? 16 : 48) /* link's distance from the bottom */
      - (startLinkElement.clientHeight) /* height of the link */;

  startLinkHasSpace.value = checkStartLinkSpace();

  window.addEventListener("resize", () => {
    startLinkHasSpace.value = checkStartLinkSpace();
  });
});

watch(() => props.showing, (showing) => {
  // perform one time actions when this slide stops showing
  if (!showing) {
    if (startLinkAnimation) {
      startLinkAnimation.cancel();
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
    :id="`slide_${slide.id}`"
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

    <div class="adventure-info">
      <button class="info-button" aria-controls="adventure-info-content" :aria-expanded="infoShowing" @click.prevent="infoShowing = !infoShowing">i</button>
      <div id="adventure-info-content" class="adventure-info-content" :hidden="!infoShowing">
        <div>Made <span v-if="author && author.madeBy">by <span v-html="author.madeBy"></span></span> with the <a href="https://github.com/TomLadek/adventure" target="_blank">Adventure CMS</a>.</div>
        <div class="author-content" v-if="author && author.content">Content &copy; {{ author.content }}</div>
      </div>
    </div>
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
  text-shadow: 4px -4px 7px #646464;
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

.slide-intro .adventure-info {
  position: absolute;
  left: 16px;
  bottom: 16px;
}

.slide-intro .adventure-info-content {
  position: absolute;
  bottom: 28px;
  left: 28px;
  width: max-content;
  padding: 1rem;
  color: white;
  text-shadow: 0 0 4px rgb(0 0 0 / 45%);
  border-radius: 20px 20px 20px 0;
  box-shadow: 0 0 3px 0 rgb(0 0 0 / 70%);
  backdrop-filter: blur(4px) grayscale(0.5) brightness(0.8);
}

.slide-intro .adventure-info-content a {
  text-shadow: none;
}

.slide-intro .info-button {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  padding-bottom: 2px;
  font-family: monospace;
  font-weight: bold;
  font-size: 18pt;
  color: #ffffff;
  background: transparent;
  border: none;
  box-shadow: 0 0 5px 0 rgb(0 0 0 / 45%);
  backdrop-filter: blur(10px) grayscale(0.5);
  text-shadow: 0px 0px 4px rgb(0 0 0 / 45%);
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
}

.slide-intro .adventure-info-content .author-content {
  margin-top: 0.5rem;
}
</style>
