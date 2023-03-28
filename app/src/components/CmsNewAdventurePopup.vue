<script>
import { defineEmits, onMounted, onUnmounted, ref } from "vue";

// import ButtonClose from "./ButtonClose.vue";
</script>

<script setup>
const emit = defineEmits(["closing"]);

function closePopup() {
  emit("closing");
}

function confirm() {
  closePopup();
}

function onKeyUp(e) {
  if (e.key === "Escape")
    closePopup()
}

const newAdventureData = ref({
  title: "",
  urlPath: "",
  author: "",
  authorText: ""
})

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
    <!-- <ButtonClose class="popup-button-close" @close-click="closePopup" /> -->

    <div class="cms-new-adventure-fields-container">
      <h2>New Adventure</h2>
      <div class="cms-new-adventure-fields">
          <label for="input-title">Title:</label>
          <input type="text" id="input-title" v-model="newAdventureData.title">
          <label for="input-url-path">URL path:</label>
          <input type="text" id="input-url-path" v-model="newAdventureData.urlPath">
          <label for="input-url-author">Author:</label>
          <input type="text" id="input-url-author" v-model="newAdventureData.author">
          <label for="input-url-author-text">Text author(s):</label>
          <input type="text" id="input-url-author-text" v-model="newAdventureData.authorText">
      </div>
      <div class="cms-new-adventure-actions">
        <button class="button-ok" @click="confirm">OK</button>
        <button class="button-cancel" @click="closePopup">Cancel</button>
      </div>
    </div>
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

.cms-new-adventure-fields-container {
  padding: 2rem;
}

.cms-new-adventure-fields-container h2 {
  margin-bottom: 2rem;
}

@media(min-width: 600px) {
  .cms-new-adventure-fields {
    display: grid;
    gap: 1rem;
    grid-template-columns: auto 1fr;
    align-items: center;
  }
}

.cms-new-adventure-fields label {
  display: block;
  margin-bottom: calc(6rem / 16);
}

@media(min-width: 600px) {
  .cms-new-adventure-fields label {
    margin: 0;
  }
}

.cms-new-adventure-fields input {
  width: 100%;
  height: 2.5rem;
  padding: 0.25rem 0.6rem;
  font-size: 1em;
  box-sizing: border-box;
  margin-bottom: 1rem;
}

.cms-new-adventure-fields input:last-child {
  margin-bottom: 0;
}

@media(min-width: 600px) {
  .cms-new-adventure-fields input {
    margin-bottom: 0;
  }
}

.cms-new-adventure-actions {
  display: flex;
  justify-content: end;
  gap: 0.5rem;
  margin-top: 2rem;
}

.cms-new-adventure-actions button {
  border: 1px solid #787878;
  border-radius: 8px;
  background: none;
  padding: 12px;
  font-size: 1em;
}

.cms-new-adventure-actions button.button-ok {
  background-color: rgba(0, 255, 21, 0.178);
}

.cms-new-adventure-actions button.button-ok:active {
    background-color: rgb(0 145 12 / 18%);
}

.cms-new-adventure-actions button.button-cancel:active {
    background-color: rgba(145, 0, 0, 0.18);
}
</style>