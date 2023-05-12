<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    required: false
  }
});

const transform = computed(() => {
  switch (props.size) {
    case "small": return "scale(0.7)";
    case "large": return "scale(1.3)";
  }

  return null;
});
</script>

<template>
<button class="cms-adventure-item-button-new">
  <svg width="32" height="32" viewbox="0 0 32 32" class="new-item-icon" :transform="transform">
    <rect x="13" y="0" rx="2" ry="2" width="6" height="32" fill="#CCCCCC"/>
    <rect x="0" y="13" rx="2" ry="2" width="32" height="6" fill="#CCCCCC"/>
  </svg>
</button>
</template>

<style>
.cms-adventure-item-button-new {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: none;
  padding: 0;
  border: none;
}

.new-item-icon {
  border: 1px solid #CCCCCC;
  border-radius: 50%;
  padding: 10px;
}
</style>