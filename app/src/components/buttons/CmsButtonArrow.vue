<script setup>
const props = defineProps({
  direction: {
    type: String,
    required: false
  }
})
</script>

<template>
<button>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke-linecap="round" stroke-linejoin="round" :transform="direction === 'right' ? 'rotate(180)' : null">
    <path d="M12,6 L5,12 L12,18" stroke-width="2" stroke="currentColor" fill="none"></path>
    <path d="M6,12 L20,12" stroke-width="2" stroke="currentColor"></path>
  </svg>
  <slot></slot>
</button>
</template>