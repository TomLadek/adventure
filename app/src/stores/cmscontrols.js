import { defineStore } from "pinia";
import { ref } from "vue";
import { isCmsView } from "../utils";

export const useCmsControlsStore = defineStore("cmsControls", () => {
  const editMode = isCmsView ? ref(true) : false;

  function toggleEditMode() {
    if (typeof editMode === "object")
      editMode.value = !editMode.value;
  }

  return { isCmsView, editMode, toggleEditMode };
});