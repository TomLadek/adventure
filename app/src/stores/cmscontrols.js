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

  const actions = {
          ADD_SLIDE: "addSlide",
          REMOVE_SLIDE: "removeSlide",
          ADD_SLIDE_CONTENT: "addSlideContent",
          ADD_SLIDE_GALLERY: "addSlideGallery",
          EDIT_TEXT: "editText"
        },
        actionArgs = {},
        actionExecutors = {};

  for (let action of Object.values(actions)) {
    actionArgs[action] = ref(null);
  }

  function validateActionName(name) {
    if (Object.values(actions).indexOf(name) >= 0)
      return true;

    throw new Error(`undefined action: ${name}`);
  }

  function action(name, args) {
    if (validateActionName(name))
      actionArgs[name].value = args;
  }

  function actionWithResult(name, args) {
    if (!validateActionName(name))
      return;

    actionArgs[name].value = args;

    const executor = {},
          promise = new Promise((resolve, reject) => {
            executor.resolve = resolve;
            executor.reject = reject;
          });

    if (actionExecutors[name])
      actionExecutors[name].reject("replaced");

    actionExecutors[name] = executor;

    return promise;
  }

  function subscribeToAction(name, callback) {
    if (validateActionName(name)) {
      watch(actionArgs[name], newValue => {
        if (actionExecutors[name]) {
          const executor = actionExecutors[name];

          delete actionExecutors[name];

          callback(newValue, executor.resolve, executor.reject);
        } else {
          callback(newValue);
        }
      });
    }
  }
  /* --- */

  return {
    isCmsView,
    editMode,
    actions,
    toggleEditMode,
    actionAddSlide,
    subscribeAddSlide,
    actionAddSlideContent,
    subscribeAddSlideContent,
    actionRemoveSlide,
    subscribeRemoveSlide,
    action,
    actionWithResult,
    subscribeToAction
  };
});