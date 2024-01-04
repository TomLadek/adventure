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

const dialog = ref(null),
      closing = ref(false);

watch(() => props.popupShowing, showing => {
    if (showing) {
      dialog.value.showModal();
      closing.value = false;
    } else {
      closing.value = true;
    }
})

function onAnimationEnd() {
  if (!props.popupShowing) {
    dialog.value.close();
    closing.value = false;
  }
}
</script>

<template>
  <dialog class="cms-adventure-popup" :class="{ closing }" ref="dialog" @animationend="onAnimationEnd" @keydown.esc.prevent>
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
  -webkit-backdrop-filter: blur(4px);
  color: white;
  border: none;
  padding: 0;
  box-shadow: 0px 0px 32px 0px #000000b5;
}

.cms-adventure-popup[open],
.cms-adventure-popup[open]::backdrop,
.cms-adventure-popup[open].closing,
.cms-adventure-popup[open].closing::backdrop {
  animation-duration: 0.15s; /* can't use variables here because the actual modal element is outside of the DOM (I think) */
  animation-timing-function: ease;
  animation-fill-mode: forwards;
}

.cms-adventure-popup[open],
.cms-adventure-popup[open]::backdrop {
  animation-name: fadein;
}

.cms-adventure-popup[open].closing,
.cms-adventure-popup[open].closing::backdrop {
  animation-name: fadeout;
}

.cms-adventure-popup::backdrop {
  background: #00000085;
}

.cms-adventure-popup-fields-container {
  padding: 2rem;
}

/*
.popup-button-close {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
}
*/

@keyframes fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeout {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>