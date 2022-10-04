<script>
</script>

<script setup>
defineProps({
  langs: {
    type: Array,
    required: true
  }
});
</script>

<template>
<div class="lang-switcher">
  <button v-for="lang in langs" @click="$i18n.locale = lang" class="lang">{{lang.toUpperCase()}}</button>
</div>
</template>

<style>
.lang-switcher {
  display: flex;
  position: absolute;    
  top: 1rem;
  right: 1rem;
  z-index: 1;
}
.lang-switcher button {
  background: transparent;
  border: none;
  color: unset;
}
</style>
