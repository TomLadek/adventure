<script setup>
import CmsAdventureItemButtonNew from '../CmsAdventureItemButtonNew.vue';

function onNewSlideClick() {
  console.log("onNewSlideClick")
}
</script>

<template>
  <section class="cms-new-adventure-slide">
    <CmsAdventureItemButtonNew class="cms-adventure-new-slide-button" @click="onNewSlideClick" />
  </section>
</template>

<style>
.cms-new-adventure-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: calc(100 * var(--vh));
}

.cms-adventure-new-slide-button {
  width: 80vw;
  height: 80vh;
  border: 2px dashed grey;
  border-radius: 5%;
}
</style>