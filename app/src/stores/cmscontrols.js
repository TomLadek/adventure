import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { isCmsView } from "../../src/utils.js";

export const useCmsControlsStore = defineStore("cmsControls", () => {
  const editMode = isCmsView ? ref(true) : false;
  
  function toggleEditMode() {
    if (typeof editMode === "object")
      editMode.value = !editMode.value;
  }

  const actions = {
          ADD_SLIDE: "addSlide",
          REMOVE_SLIDE: "removeSlide",
          ADD_SLIDE_CONTENT: "addSlideContent",
          ADD_SLIDE_GALLERY_IMG: "addSlideGalleryImg",
          DEL_SLIDE_GALLERY_IMG: "removeGalleryImg",
          ADD_SLIDE_GALLERY_IMG_CAPTION: "addSlideGalleryImgCaption",
          EDIT_TEXT: "editText",
          CHANGE_SLIDE_CONTENT_POSITION: "changeSlideContentPosition",
          CHANGE_SLIDE_GALLERY_STYLE: "changeSlideGalleryStyle"
        },
        actionArgs = Object.values(actions).reduce((actArgs, act) => {
          actArgs[act] = ref(null);
          return actArgs;
        }, {}),
        actionExecutors = {};

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

  return {
    isCmsView,
    editMode,
    actions,
    toggleEditMode,
    action,
    actionWithResult,
    subscribeToAction
  };
});