<script>
import { ref, watch } from "vue";
// import ButtonClose from "./ButtonClose.vue";
</script>

<script setup>
const props = defineProps({
  popupShowing: {
    required: true,
    type: Boolean
  }
});

const dialog = ref(null);

watch(() => props.popupShowing, (open) => {
    if (open)
      dialog.value.showModal();
    else
      dialog.value.close();
})
</script>

<template>
  <dialog class="cms-adventure-popup" ref="dialog">
    <!-- <ButtonClose class="popup-button-close" @close-click="closePopup" /> -->

    <div class="cms-adventure-popup-fields-container">
      <slot></slot>
    </div>
  </dialog>
</template>

<style>
.cms-adventure-popup {
  width: min(30rem, 80vw);
  border-radius: 32px;
  background: #0000008a;
  backdrop-filter: blur(10px);
  color: white;
  border: none;
  padding: 0;
  box-shadow: 0px 0px 32px 0px #000000b5;
  /* transition: all 0.15s ease; */
}

.cms-adventure-popup[open] {
  animation: fadeIn 0.15s ease normal;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.cms-adventure-popup::backdrop {
  /* animation: backdropFade 0.15s ease normal; */
  background: #00000085;
}


/* TODO fix backdrop animation and closing animations in general */
/* @keyframes backdropFade {
  from {
    background: #00000000;
  }
  to {
    background: #00000085;
  }
} */

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