import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useLinksStore = defineStore("links", () => {
  const pending = ref(false),
        linkText = ref(""),
        linkTextSuggested = ref(""),
        linkHref = ref("")
  
  let onConfirm, onCancel

  function reset() {
    pending.value = false
  }

  function getLink(linkTextParam, linkHrefParam, onConfirmCallback, onCancelCallback) {
    linkText.value = linkTextParam
    linkHref.value = linkHrefParam
    onConfirm = onConfirmCallback
    onCancel = onCancelCallback
    pending.value = true
  }

  function confirm() {
    if (typeof onConfirm === "function")
      onConfirm(linkText.value, linkTextSuggested.value, linkHref.value)

    reset()
  }

  function cancel() {
    if (typeof onCancel === "function")
      onCancel()

    reset()
  }

  watch(linkHref, newVal => linkTextSuggested.value = (newVal || "").replace(/^.*?:\/\/|[?#].*$|\/$/g, ""))

  return { getLink, linkText, linkTextSuggested, linkHref, pending, confirm, cancel }
})