<script>
import { useCmsControlsStore } from "../stores/cmscontrols.js";
</script>

<script setup>
const cmsControlsStore = useCmsControlsStore();
</script>

<template>
<div class="cms-controls" data-id-cmspanel>
  <p data-id-cmsheadline>CMS controls</p>
  <p>
    <label>Edit mode:
      <input type="checkbox" v-model="cmsControlsStore.editMode" data-id-cmscheckbox>
    </label>
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