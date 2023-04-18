import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfirmationStore = defineStore("confirmation", () => {
  let onConfirm, onCancel
  const pending = ref(false),
        headline = ref(""),
        content = ref("")

  function reset() {
    pending.value = false
    headline.value = ""
    content.value = ""
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