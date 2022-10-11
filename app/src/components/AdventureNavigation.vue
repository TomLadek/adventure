<script>
import { defineProps } from "vue";
</script>

<script setup>
const props = defineProps({
  slideCount: {
    type: Number,
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
</script>

<template>
<ol class="dots">
  <li v-for="i in slideCount" :class="{active: i - 1 === slideChange.current}"><a :href="`#slide${i - 1}`"></a></li>
</ol>
</template>

<style>
.dots {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  height: 100%;
  position: absolute;
  right: 0.8rem;
  top: 0;
  z-index: 1;
}

ol.dots {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dots li {
  background-color: white;
  opacity: 0.6;
  border-radius: 50%;
}

.dots li.active {
  opacity: 1;
}

.dots li a {
  display: block;
  width: 1rem;
  height: 1rem;
}
</style>