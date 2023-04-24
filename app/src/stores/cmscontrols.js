import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { isCmsView } from "../../src/utils.js";

export const useCmsControlsStore = defineStore("cmsControls", () => {
  const editMode = isCmsView ? ref(true) : false;
  
  function toggleEditMode() {
    if (typeof editMode === "object")
    editMode.value = !editMode.value;
  }

  /* AddSlide */
  const addSlideArgs = ref(null);

  function actionAddSlide(args) {
    addSlideArgs.value = args;
  }

  function subscribeAddSlide(callback) {
    watch(addSlideArgs, () => {
      callback(addSlideArgs.value);
    })
  }
  /* --- */

  /* AddSlideContent*/
  const addSlideContentArgs = ref(null);

  function actionAddSlideContent(args) {
    addSlideContentArgs.value = args;
  }

  function subscribeAddSlideContent(callback) {
    watch(addSlideContentArgs, () => {
      callback(addSlideContentArgs.value);
    });
  }
  /* --- */

  /* RemoveSlide */
  const removeSlideArgs = ref(null);

  function actionRemoveSlide(args) {
    removeSlideArgs.value = args;
  }

  function subscribeRemoveSlide(callback) {
    watch(removeSlideArgs, () => {
      callback(removeSlideArgs.value);
    })
  }
  /* --- */

  return {
    isCmsView,
    editMode,
    toggleEditMode,
    actionAddSlide,
    subscribeAddSlide,
    actionAddSlideContent,
    subscribeAddSlideContent,
    actionRemoveSlide,
    subscribeRemoveSlide
  };
});