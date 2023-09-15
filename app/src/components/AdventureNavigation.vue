<script>
import { ref } from 'vue';

/* CMS */
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCmsControlsStore } from '../stores/cmscontrols.js';
/* /CMS */
</script>

<script setup>
const props = defineProps({
  slides: {
    type: Array,
    required: true
  },
  slideChange: {
    last: {
      type: Number
    },
    current: {
      type: Number
    },
    duration: {
      type: Number
    }
  }
});

let navLinkHrefs = ref(props.slides.reduce((prev, _, i) => {
  prev[i + 1] = `#slide${i}`;
  return prev;
}, {}));

let getNavLinkActive = function(i) {
  return i === props.slideChange.current;
}

/* CMS */
const cmsControlsStore = useCmsControlsStore(),
      { fullScroll } = storeToRefs(cmsControlsStore),
      { isCmsView } = cmsControlsStore,
      slideThresholds = [],
      activeNavLinkIndex = ref(0);

navLinkHrefs = ref(props.slides.reduce((prev, curr, i) => {
  prev[i + 1] = computed(() => {
    if (isCmsView && !fullScroll.value) {
      return `#slide_${curr.id}`;
    } else {
      return `#slide${i}`;
    }
  });
  return prev;
}, {}));

getNavLinkActive = function(i) {
  if (isCmsView && !fullScroll.value) {
    return i === activeNavLinkIndex.value;
  } else {
    return i === props.slideChange.current;
  }
}

function calculateSlideThresholds() {
  slideThresholds.length = 0;
  slideThresholds.push(0);

  for (const slide of props.slides) {
    const slideElement = document.getElementById(`slide_${slide.id}`);

    slideThresholds.push(slideElement.offsetTop + slideElement.clientHeight / 2)
  }
}

onMounted(() => {
  calculateSlideThresholds();

  window.addEventListener("resize", calculateSlideThresholds);

  window.addEventListener("scroll", () => {
    for (let i = slideThresholds.length - 1; i >= 0; i--) {
      if (window.scrollY > slideThresholds[i]) {
        activeNavLinkIndex.value = i;
        break;
      }
    }
  });
});
/* /CMS */
</script>

<template>
<ol class="dots slide-themed">
  <li v-for="i in slides.length" :class="{active: getNavLinkActive(i - 1)}"><a :href="navLinkHrefs[i]"></a></li>
</ol>
</template>

<style>
.dots {
  display: flex;
  justify-content: center;
  position: fixed;
  z-index: 1;
}

@media (max-width: 767px) {
  .dots {
    justify-content: space-between;
    width: calc(100% - 16px);
    bottom: 8px;
    gap: 1px;
    left: 8px;
  }
}

@media (min-width: 768px) {
  .dots {
    flex-direction: column;
    gap: 0.5rem;
    right: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
  }
}

ol.dots {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dots li {
  display: flex;
  align-items: center;
  opacity: 0.5;
  width: 100%;
  height: 0.5rem;
  background-color: white;
  transition-property: opacity, background-color ;
  transition-duration: 0.3s, var(--default-anim-time);
  transition-timing-function: ease;
}

.dots li:hover {
  opacity: 0.75;
}

@media (min-width: 768px) {
  .dark .dots li {
    background-color: #4e4e4e;
  }
}

@media (min-width: 768px) {
  .dots li {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
  }
}

.dots li.active {
  opacity: 1;
  border-radius: 2px;
}

@media (min-width: 768px) {
  .dots li.active {
    border-radius: 50%;
  }
}

.dots li a {
  display: block;
  height: 300%;
  width: 100%;
}

@media (min-width: 768px) {
  .dots li a {
    width: 1rem;
    height: 1rem;
  }
}
</style>