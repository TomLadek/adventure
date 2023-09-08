<script>
import { ref, onMounted } from 'vue';
</script>

<script setup>
const progress = ref("0%");

onMounted(() => {
  setInterval(() => {
    progress.value = `${(parseInt(progress.value) + Math.floor(Math.random() * 20)) % 101}%`;
  }, 500);
});
</script>

<template>
<span class="progress-bar"></span>
</template>

<style>
.progress-bar {
  position: relative;
  height: 1rem;
  box-shadow: inset 0px 0px 0px 1px #3a3f44;
  border-radius: 0.5rem;
}

.progess-bar::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  width: calc(v-bind(progress) - 2px);
  height: calc(1rem - 2px);
  background: #005bab;
  border-radius: 0.5rem;
  transition: width 0.2s ease-out;
}
</style>