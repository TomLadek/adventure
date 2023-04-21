import { defineStore } from "pinia";
import { ref } from "vue";
import { isCmsView } from "../../src/utils.js";

export const useCmsControlsStore = defineStore("cmsControls", () => {
  const editMode = isCmsView ? ref(true) : false;

  function toggleEditMode() {
    if (typeof editMode === "object")
      editMode.value = !editMode.value;
  }

  return { isCmsView, editMode, toggleEditMode };
});