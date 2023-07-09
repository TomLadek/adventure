<script>
import { useCmsControlsStore } from "../stores/cmscontrols.js";
</script>

<script setup>
const props = defineProps({
  slides: {
    type: Array,
    required: false
  }
});

const cmsControlsStore = useCmsControlsStore();

function publish() {
  console.log("publishing ...")
  cmsControlsStore.action(cmsControlsStore.actions.PUBLISH);
}
</script>

<template>
<div class="cms-controls">
  <p class="cms-controls-title">CMS controls</p>
  <div class="cms-controls-input">
    <label for="input-edit-mode">Edit mode:</label>
    <input id="input-edit-mode" type="checkbox" class="cms-controls-toggle" :class="{ 'toggle-on': cmsControlsStore.editMode }" v-model="cmsControlsStore.editMode">
  </div>
  <div class="cms-controls-input centered">
    <button class="cms-button-publish" @click="publish">Publish & distribute</button>
  </div>
</div>
</template>

<style>
.cms-controls {
  z-index: 100;
  position: fixed;
  left: 1rem;
  top: 1rem;
  padding: 1.5rem;
  color: #fff;
  border-radius: 1.5rem;
  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(4px);
}

.cms-controls-title {
  font-size: 120%;
}

.cms-controls-toggle {
  position: relative;
  margin: 0;
  width: 2.5rem;
  height: 1.25rem;
  cursor: pointer;
}

.cms-controls-toggle:before {
  content: "";
  display: inline-block;
  width: 2.5rem;
  height: 1.25rem;
  border-radius: 0.5rem;
  background-color: rgb(102, 102, 102);
  transition: background-color 0.15s ease-out;
}

.cms-controls-toggle:hover::before {
    background: rgb(137 137 137);
}

.cms-controls-toggle.toggle-on:before {
  background-color: rgb(0, 130, 216);
}

.cms-controls-toggle.toggle-on:hover::before {
    background: rgb(33 156 238);
}

.cms-controls-toggle:after {
  content: "";
  position: absolute;
  left: 2px;
  top: 0.1rem;
  background: white;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  transition-property: left;
  transition-duration: 0.15s;
  transition-timing-function: ease-out;
}

.cms-controls-toggle.toggle-on:after {
  left: calc(1.5rem - 2px);
}

.cms-controls-input {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cms-controls-input.centered {
  justify-content: center;
}

.cms-button-publish {
  padding: 0.5rem 1rem;
  color: inherit;
  background: transparent;
  border-radius: 0.5rem;
}
</style>