<script setup>
const props = defineProps({
  cancelText: {
    type: String,
    required: false,
    default: "Cancel"
  },
  okText: {
    type: String,
    required: false,
    default: "OK"
  },
  showOkButton: {
    type: Boolean,
    required: false,
    default: true
  }
});

defineEmits(["confirm", "cancel"]);
</script>

<template>
  <div class="cms-adventure-popup-actions-container">
    <button class="button-ok" v-if="showOkButton" @click="$emit('confirm')" value="ok">{{ okText }}</button>
    <button class="button-cancel" @click="$emit('cancel')" value="cancel">{{ cancelText }}</button>
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
  border: 1px solid #5f5f5f7d;
  border-radius: 8px;
  background: none;
  padding: 12px;
  font-size: 1em;
  transition: background-color 0.15s ease;
}

.cms-adventure-popup-actions-container button.button-ok {
  background-color: hsl(204, 100%, 36%);
}

.cms-adventure-popup-actions-container button.button-ok:hover {
  background-color: hsl(204, 100%, 42%);
}

.cms-adventure-popup-actions-container button.button-ok:active {
  background-color: hsl(204, 100%, 48%);
}

.cms-adventure-popup-actions-container button.button-cancel:hover {
  background-color: hsla(0, 0%, 18%);
}

.cms-adventure-popup-actions-container button.button-cancel:active {
  background-color: hsla(0, 0%, 27%);
}
</style>