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
  justify-content: center;
  position: absolute;
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
    height: 100%;
    right: 0.8rem;
    top: 0;
  }
}

ol.dots {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dots li {
  opacity: 0.5;
  width: 100%;
  height: 0.5rem;
  transition: background-color var(--default-anim-time) ease;
}

.dots li {
  background-color: white;
}

@media (min-width: 768px) {
  .dark .dots li {
    background-color: #4e4e4e;
  }
}

@media (min-width: 768px) {
  .dots li {
    widows: 1rem;
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
  height: 100%;
}

@media (min-width: 768px) {
  .dots li a {
    width: 1rem;
    height: 1rem;
  }
}
</style>