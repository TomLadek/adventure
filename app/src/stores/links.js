import { defineStore } from "pinia";
import { ref } from "vue";

export const useLinksStore = defineStore("links", () => {
  const pending = ref(false),
        linkText = ref(""),
        linkHref = ref("")
  
  let onConfirm, onCancel

  function reset() {
    pending.value = false
    linkText.value = ""
    linkHref.value = ""
  }

  function getLink(linkTextParam, linkHrefParam, onConfirmCallback, onCancelCallback) {
    pending.value = true
    linkText.value = linkTextParam
    linkHref.value = linkHrefParam
    onConfirm = onConfirmCallback
    onCancel = onCancelCallback
  }

  function confirm() {
    if (typeof onConfirm === "function")
      onConfirm(linkText.value, linkHref.value)

    reset()
  }

  function cancel() {
    if (typeof onCancel === "function")
      onCancel()

    reset()
  }

  return { getLink, linkText, linkHref, pending, confirm, cancel }
})