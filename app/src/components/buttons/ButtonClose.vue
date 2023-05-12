<script setup>
import { defineEmits } from "vue";

defineEmits(["close-click"]);
</script>

<template>
  <button class="button-close" @click="this.$emit('close-click')">
    <svg width="30" height="30" view-box="0 0 30 30" stroke="#787878" stroke-width="3px" stroke-linecap="round">
      <line x1="10" y1="10" x2="20" y2="20"></line>
      <line x1="10" y1="20" x2="20" y2="10"></line>
    </svg>
  </button>
</template>

<style>
.button-close {
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid #787878;
  border-radius: 50%;
  background: #fff;
}
</style>