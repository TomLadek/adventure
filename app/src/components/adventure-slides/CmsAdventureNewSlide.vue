<script setup>
import { ref, computed } from 'vue';
import CmsAdventureItemButtonNew from '../CmsAdventureItemButtonNew.vue';

const emit = defineEmits(["addSlide"]);

const imgData = ref("")

function fileSelected(e) {
  emit("addSlide", e.target.files[0])
}

const img = computed(() => `url(${imgData.value})`)
</script>

<template>
  <section class="cms-new-adventure-slide">
    <div class="new-slide-container">
      <CmsAdventureItemButtonNew class="cms-adventure-new-slide-button" />
      <input type="file" @change="fileSelected" accept="image/jpeg,image/png,image/gif">
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
}

.cms-new-adventure-slide .new-slide-container {
  position: relative;
}

.cms-new-adventure-slide input[type=file] {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  opacity: 0;
  cursor: pointer;
}
</style>