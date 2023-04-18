<script>
// import ButtonClose from "./ButtonClose.vue";
</script>

<script setup>
const props = defineProps({
  popupShowing: {
    required: true,
    type: Boolean
  }
})
</script>

<template>
  <Transition name="popup-fade">
    <div v-if="popupShowing" class="cms-adventure-popup">
      <div class="cms-adventure-popup-content">
        <!-- <ButtonClose class="popup-button-close" @close-click="closePopup" /> -->
  
        <div class="cms-adventure-popup-fields-container">
          <slot></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.cms-adventure-popup {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  color: initial;
  background: #00000036;
  z-index:101;
}

.cms-adventure-popup-content {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(30rem, 80vw);
  transform: translate(-50%, -50%);
  border-radius: 32px;
  background: #fff;
  box-shadow: 0px 0px 32px 0px #686868;
}

/*
.popup-button-close {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
}
*/

.cms-adventure-popup-fields-container {
  padding: 2rem;
}

.popup-fade-enter-active, .popup-fade-leave-active {
  transition: all 0.2s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}
</style>