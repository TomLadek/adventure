import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfirmationStore = defineStore("confirmation", () => {
  const pending = ref(false),
        headline = ref(""),
        content = ref("")
  let onConfirm, onCancel

  function reset() {
    pending.value = false
  }

  function getConfirmation(headlineValue, contentValue, onConfirmCallback, onCancelCallback) {
    pending.value = true
    headline.value = headlineValue
    content.value = contentValue
    onConfirm = onConfirmCallback
    onCancel = onCancelCallback
  }

  function confirm() {
    if (typeof onConfirm === "function")
      onConfirm()

    reset()
  }

  function cancel() {
    if (typeof onCancel === "function")
      onCancel()

    reset()
  }

  return { getConfirmation, confirm, cancel, pending, headline, content }
})