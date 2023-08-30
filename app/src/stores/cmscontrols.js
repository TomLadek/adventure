import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { isCmsView, setCookie } from "../../src/utils.js";
import { usePageContext } from "../../renderer/usePageContext.js";

export const useCmsControlsStore = defineStore("cmsControls", () => {
  const { userSettings } = usePageContext();

  const editModeUserSettingsKey = "CmsControls-editmode",
        editMode = (() => {
          if (isCmsView) {
            if (userSettings && typeof userSettings.editmode !== "undefined")
              return ref(userSettings.editmode === "true")

            return ref(true);
          }

          return false;
        })(),
        fullScrollUserSettingsKey = "CmsControls-fullscroll",
        fullScroll = (() => {
          if (isCmsView) {
            if (userSettings && typeof userSettings.fullscroll !== "undefined")
              return ref(userSettings.fullscroll === "true")

            return ref(false);
          }

          return false;
        })(),
        actions = {
          ADD_SLIDE: "addSlide",
          REMOVE_SLIDE: "removeSlide",
          ADD_SLIDE_CONTENT: "addSlideContent",
          ADD_SLIDE_GALLERY_IMGS: "addSlideGalleryImg",
          DEL_SLIDE_GALLERY_IMG: "removeGalleryImg",
          ADD_SLIDE_GALLERY_IMG_CAPTION: "addSlideGalleryImgCaption",
          EDIT_TEXT: "editText",
          CHANGE_SLIDE_MAIN_IMG: "changeSlideMainImg",
          CHANGE_SLIDE_CONTENT_POSITION: "changeSlideContentPosition",
          CHANGE_SLIDE_GALLERY_STYLE: "changeSlideGalleryStyle",
          CHANGE_SLIDE_GALLERY_IMG_POSITION: "changeSlideGalleryImgPosition",
          CHANGE_SLIDE_PROPS: "changeSlideProps",
          DEL_SLIDE_CONTENT: "removeSlideContent",
          PUBLISH: "publish",
          TRANSLATE_TEXT: "translateText"
        },
        actionArgs = Object.values(actions).reduce((actArgs, act) => {
          actArgs[act] = ref(null);
          return actArgs;
        }, {}),
        actionExecutors = {};
  
  function toggleEditMode() {
    if (typeof editMode === "object")
      editMode.value = !editMode.value;
  }

  function validateActionName(name) {
    if (Object.values(actions).indexOf(name) >= 0)
      return true;

    throw new Error(`undefined action: ${name}`);
  }

  function action(name, args) {
    if (validateActionName(name))
      actionArgs[name].value = args || Math.random();
  }

  function actionWithResult(name, args) {
    if (!validateActionName(name))
      return;

    actionArgs[name].value = args || Math.random();

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

  watch(editMode, newVal => setCookie(editModeUserSettingsKey, newVal))

  watch(fullScroll, newVal => setCookie(fullScrollUserSettingsKey, newVal))

  return {
    isCmsView,
    editMode,
    fullScroll,
    actions,
    toggleEditMode,
    action,
    actionWithResult,
    subscribeToAction
  };
});