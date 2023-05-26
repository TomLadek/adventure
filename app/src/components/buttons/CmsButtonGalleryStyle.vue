<script setup>
const props = defineProps({
  variant: {
    type: String,
    required: false
  },
  selected: {
    type: Boolean,
    required: false
  }
});
</script>

<template>
  <button class="gallery-style-button" :class="{ selected: selected }">
    <svg v-if="variant === 'grid'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 38" width="35" height="30">
      <rect class="gallery-style-rect" x="4" y="4" width="14" height="14" rx="5" ry="5" fill="rgba(255, 255, 255, 0.4)" stroke="rgb(0, 0, 0)"></rect>
      <rect class="gallery-style-rect" x="20" y="4" width="14" height="14" rx="5" ry="5" fill="rgba(255, 255, 255, 0.4)" stroke="rgb(0, 0, 0)"></rect>
      <rect class="gallery-style-rect" x="4" y="20" width="14" height="14" rx="5" ry="5" fill="rgba(255, 255, 255, 0.4)" stroke="rgb(0, 0, 0)"></rect>
      <rect class="gallery-style-rect" x="20" y="20" width="14" height="14" rx="5" ry="5" fill="rgba(255, 255, 255, 0.4)" stroke="rgb(0, 0, 0)"></rect>
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 16" width="35" height="25">
      <rect class="gallery-style-rect" x="4" y="0" width="14" height="14" rx="5" ry="5" fill="rgba(255, 255, 255, 0.4)" stroke="rgb(0, 0, 0)"></rect>
      <rect class="gallery-style-rect" x="20" y="0" width="14" height="14" rx="5" ry="5" fill="rgba(255, 255, 255, 0.4)" stroke="rgb(0, 0, 0)"></rect>
      <rect class="gallery-style-rect" x="36" y="0" width="14" height="14" rx="5" ry="5" fill="rgba(255, 255, 255, 0.4)" stroke="rgb(0, 0, 0)"></rect>
    </svg>
  </button>
</template>

<style>
.gallery-style-button {
  outline: none;
}

.gallery-style-button:focus-visible svg {
  border: 1px solid #fff;
  border-radius: 8px;
}

.gallery-style-button svg rect.gallery-style-rect {
  transition: fill 0.15s ease-out;
}

.gallery-style-button.selected svg rect.gallery-style-rect {
  fill: rgba(255, 255, 255, 1);
}

.gallery-style-button:not(.selected):hover svg rect.gallery-style-rect,
.gallery-style-button:not(.selected):active svg rect.gallery-style-rect,
.gallery-style-button:not(.selected):focus-visible svg rect.gallery-style-rect {
  fill: rgba(255, 255, 255, 0.75)
}
</style>