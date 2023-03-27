<script>
import { defineEmits, onMounted, onUnmounted } from "vue";
</script>

<script setup>
const emit = defineEmits(["closing"]);

function closePopup() {
  emit("closing");
}

function onKeyUp(e) {
  if (e.key === "Escape")
    closePopup()
}

onMounted(() => {
  addEventListener("keyup", onKeyUp);
})

onUnmounted(() => {
  removeEventListener("keyup", onKeyUp);
})
</script>

<template>
<div class="cms-new-adventure-popup">
  <div class="cms-new-adventure-popup-content">
    <button class="popup-button-close" @click="closePopup">
      <svg width="30" height="30" view-box="0 0 30 30" stroke="#787878" stroke-width="3px" stroke-linecap="round">
        <line x1="10" y1="10" x2="20" y2="20"></line>
        <line x1="10" y1="20" x2="20" y2="10"></line>
      </svg>
    </button>
  </div>
</div>
</template>

<style>
.cms-new-adventure-popup {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #00000036;
}

.cms-new-adventure-popup-content {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(40rem, 80vw);
  height: 30rem;
  transform: translate(-50%, -50%);
  border-radius: 32px;
  background: #fff;
  box-shadow: 0px 0px 32px 0px #686868;
}

.popup-button-close {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid #787878;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}
</style>