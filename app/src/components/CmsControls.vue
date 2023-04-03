<script>
import { defineProps } from "vue";
import { useCmsControlsStore } from "../stores/cmscontrols.js";
</script>

<script setup>
const props = defineProps({
  slides: {
    type: Array,
    required: false
  },
  imageSizes: {
    type: Function,
    required: false
  }
});

const cmsControlsStore = useCmsControlsStore();

function send() {
  console.log("send clicked")

  fetch("/rest/adventure/1/edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: {
        id: "ABC",
        value: "askdj"
      }
    })
  })
}

function addSlideClicked() {
  props.slides.push({
    id: `id-${Math.floor(Math.random() * 1000)}`,
    content: { text: "Test content" },
    headline: "Test headline",
    mainImgAttrs: {
      "data-pswp-width": 4032,
      "data-pswp-height": 3024,
      "data-cropped": true
    },
    mainImgTitle: "Test caption",
    mainImg: props.imageSizes("20230204_144745")
  })
}
</script>

<template>
<div class="cms-controls" data-id-cmspanel>
  <p data-id-cmsheadline>CMS controls</p>
  <p>
    <label>Edit mode:
      <input type="checkbox" v-model="cmsControlsStore.editMode" data-id-cmscheckbox>
    </label>
  </p>
  <p>
    <button @click="send">Send</button>
  </p>
  <p>
    <button @click="addSlideClicked">add slide</button>
  </p>
  <p>
    
  </p>
</div>
</template>

<style>
.cms-controls[data-id-cmspanel] {
  z-index: 100;
  position: fixed;
  left: 1rem;
  top: 1rem;
  padding: 1rem;
  border: 1px solid black;
}
</style>