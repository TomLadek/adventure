<script setup>
defineEmits(["confirm", "cancel"])
</script>

<template>
  <div class="cms-adventure-popup-actions-container">
    <button class="button-ok" @click="$emit('confirm')">OK</button>
    <button class="button-cancel" @click="$emit('cancel')">Cancel</button>
  </div>
</template>

<style>
.cms-adventure-popup-actions-container {
  display: flex;
  justify-content: end;
  gap: 0.5rem;
  margin-top: 2rem;
}

.cms-adventure-popup-actions-container button {
  border: 1px solid #787878;
  border-radius: 8px;
  background: none;
  padding: 12px;
  font-size: 1em;
}

.cms-adventure-popup-actions-container button.button-ok {
  background-color: rgba(0, 255, 21, 0.178);
}

.cms-adventure-popup-actions-container button.button-ok:active {
    background-color: rgb(0 145 12 / 18%);
}

.cms-adventure-popup-actions-container button.button-cancel:active {
    background-color: rgba(145, 0, 0, 0.18);
}
</style>