<script>
import CmsPopup from "./CmsPopup.vue";
import CmsPopupActionButtons from "./CmsPopupActionButtons.vue";

import { useConfirmationStore } from "../stores/confirmation.js";
</script>

<script setup>
const props = defineProps({
  confirmPopupShowing: {
    required: true,
    type: Boolean
  }
});

const confirmationStore = useConfirmationStore();
</script>

<template>
  <CmsPopup :popupShowing="confirmPopupShowing">
    <h2>{{ confirmationStore.headline }}</h2>
    <div class="confirmation-content" v-html="confirmationStore.content"></div>
    <CmsPopupActionButtons @confirm="confirmationStore.confirm" @cancel="confirmationStore.cancel" />
  </CmsPopup>
</template>

<style>
  .cms-adventure-popup .confirmation-content p {
    margin: 1rem 0;
    line-height: 1.4;
  }
</style>