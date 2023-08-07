<script setup>
import { ref, computed } from 'vue';
import { useCmsControlsStore } from '../../stores/cmscontrols.js';
import CmsAdventureItemButtonNew from '../buttons/CmsAdventureItemButtonNew.vue';

const imgData = ref(""),
      firstSlideImgInput = ref(null),
      cmsControlsStore = useCmsControlsStore()

const img = computed(() => `url(${imgData.value})`)
</script>

<template>
  <section class="cms-new-adventure-slide">
    <div class="new-slide-container">
      <CmsAdventureItemButtonNew class="cms-adventure-new-slide-button" @click="firstSlideImgInput.click()" size="large" />
      <input type="file" @change="cmsControlsStore.action(cmsControlsStore.actions.ADD_SLIDE, $event.target.files[0])" accept="image/jpeg,image/png,image/gif" ref="firstSlideImgInput">
    </div>
  </section>
</template>

<style>
.cms-new-adventure-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: calc(100 * var(--vh));
  background-image: v-bind(img);
}

.cms-adventure-new-slide-button {
  width: 80vw;
  height: 80vh;
  border: 2px dashed grey;
  border-radius: 5%;
  transition: background-color 0.1s ease;
}

.cms-adventure-new-slide-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.cms-new-adventure-slide input[type=file] {
  position: absolute;
  visibility: hidden;
  width: 0;
  height: 0;
}
</style>