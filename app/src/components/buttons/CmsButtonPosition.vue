<script>
import { computed } from "vue";
</script>

<script setup>
const props = defineProps({
  alignPos: {
    type: String,
    required: false
  },
  selected: {
    type: Boolean,
    required: false
  }
});

const alignCoords = computed(() => {
  switch (props.alignPos) {
    case "center": return { x: 12, y: 7 };

    case "start top":
    case "top start": return { x: 8, y: 4 };

    case "end top":
    case "top end": return { x: 17, y: 4 };

    case "start bottom":
    case "bottom start": return { x: 8, y: 9 };

    case "end bottom":
    case "bottom end": return { x: 17, y: 9 };
  }
});
</script>

<template>
  <button class="position-button" :class="{ selected: selected }">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 30" width="35" height="25">
      <rect class="position-rect-outer" width="36" height="28" rx="8" ry="8" stroke="rgb(255, 255, 255)" fill="rgba(0, 0, 0, 0)" x="4" y="1"></rect>
      <rect class="position-rect-inner" fill="rgba(255, 255, 255, 0.2)" stroke="rgb(255, 255, 255)" :x="alignCoords.x" :y="alignCoords.y" width="20" height="16" rx="5" ry="5"></rect>
    </svg>
  </button>
</template>

<style>
.position-button {
  outline: none;
}

.position-button:focus-visible svg rect.position-rect-outer {
  stroke-width: 2px;
  stroke: #fff;
}

.position-button svg rect.position-rect-inner {
  transition: fill 0.15s ease-out;
}

.position-button.selected svg rect.position-rect-inner {
  fill: rgba(255, 255, 255, 1);
}

.position-button:not(.selected):hover svg rect.position-rect-inner,
.position-button:not(.selected):active svg rect.position-rect-inner,
.position-button:not(.selected):focus-visible svg rect.position-rect-inner {
  fill: rgba(255, 255, 255, 0.75)
}
</style>