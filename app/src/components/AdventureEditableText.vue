<script>
import { ref, computed } from 'vue';
import { useVI18nHtml } from '../composables/vI18nHtml.js';

/* CMS */
import { watch } from 'vue'; 
import { useEditor, EditorContent } from '@tiptap/vue-3';
import tippy from 'tippy.js';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

import { useCmsControlsStore } from '../stores/cmscontrols.js';
/* /CMS */
</script>

<script setup>
const props = defineProps({
  i18n: {
    type: Object,
    required: true
  },
  textModule: {
    type: String,
    required: true
  },
  isMultiline: {
    type: Boolean,
    required: false
  },
  focusAction: {
    type: Object,
    required: false
  },
  class: {
    type: String,
    required: false
  },
  emptyPlaceholder: {
    type: String,
    required: false
  }
});

const { vI18nHtml } = useVI18nHtml(props.i18n.t);

const translatedText = computed(() => {
  if (!props.textModule)
    return "";

  const translation = props.i18n.t(props.textModule);

  if (translation === props.textModule)
    return "";

  return translation;
});

let realTextDisplay = true;

/* CMS */
const emit = defineEmits(["blur", "save"]);

const cmsControlsStore = useCmsControlsStore(),
      cmsTextEditor = ref(null),
      cmsTextEditorControls = ref(null),
      cmsEditorControlsShown = ref(false),
      cmsTextSyncStatusValue = { WRITING: 0, SYNCING: 1, SYNCED: 2, ERROR: 3 },
      cmsTextSyncStatus = ref(cmsTextSyncStatusValue.SYNCED),
      editorReady = ref(false);

realTextDisplay = computed(() => !cmsControlsStore.editMode || !editorReady.value)

let cmsTextSyncTimeout = 0,
    tippyInstance;

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.emptyPlaceholder || "Empty",
    })
  ],
  content: translatedText.value,
  onBeforeCreate() {
    editorReady.value = true;
  },
  onUpdate({ editor }) {
    cmsTextSyncStatus.value = cmsTextSyncStatusValue.WRITING;

    clearTimeout(cmsTextSyncTimeout);

    cmsTextSyncTimeout = setTimeout(() => {
      emit("save");

      cmsTextSyncStatus.value = cmsTextSyncStatusValue.SYNCING;

      cmsControlsStore.actionWithResult(cmsControlsStore.actions.EDIT_TEXT, {
        textModule: props.textModule,
        locale: props.i18n.locale,
        newText: processContent(editor.getHTML())
      }).then(() => {
        cmsTextSyncStatus.value = cmsTextSyncStatusValue.SYNCED;
      }).catch(reason => {
        console.error(reason)
        cmsTextSyncStatus.value = cmsTextSyncStatusValue.ERROR;  
      }).finally(() => {
        checkShouldHideControls();
        cmsTextSyncTimeout = 0;        
      });
    }, 1000);
  },
  onFocus() {
    cmsEditorControlsShown.value = true;
  },
  onBlur() {
    emit("blur");
    checkShouldHideControls();
  }
});

function checkShouldHideControls() {
  if ([cmsTextSyncStatusValue.WRITING, cmsTextSyncStatusValue.SYNCING].indexOf(cmsTextSyncStatus.value) >= 0)
    return;

  setTimeout(() => {
    let someHaveFocus = editor.value.isFocused;

    if (cmsTextEditorControls.value) {
      cmsTextEditorControls.value
        .querySelectorAll("[data-editor-action]")
        .forEach(editorAction => someHaveFocus |= document.activeElement === editorAction);
    }
      
    if (!someHaveFocus)
      cmsEditorControlsShown.value = false;
  }, 100);
}

function editorAction(type) {
  switch (type) {
    case "bold":
      editor.value.commands.toggleBold();
      break;
    case "italics":
      editor.value.commands.toggleItalic();
      break;
    case "undo":
      editor.value.commands.undo();
      break;
    case "redo":
      editor.value.commands.redo();
      break;
    case "shy":
      editor.value.commands.insertContent(String.fromCodePoint(0x00AD) /* &shy; */);
      break;
  }

  editor.value.commands.focus();
}

function processContent(htmlContent) {
  let newContent = htmlContent;

  // Filter out <p> tag if there's only one
  const paragraphsMatch = htmlContent.match(/<\/p>/g);
  if (paragraphsMatch && paragraphsMatch.length < 2)
    newContent = newContent.replace(/<\/?p>/g, "");
  
  // Replace '­' with '&shy;'
  newContent = newContent.replace(String.fromCodePoint(0x00AD), "&shy;");

  return newContent;
}

watch(() => props.i18n.locale, () => editor.value.commands.setContent(translatedText.value));
watch(() => props.textModule, () => editor.value.commands.setContent(translatedText.value));

if (props.focusAction)
  watch(props.focusAction, () => editor.value.commands.focus());

watch(cmsEditorControlsShown, (shown) => {
  if (!cmsTextEditor.value)
    return;

  if (!tippyInstance) {
    tippyInstance = tippy(cmsTextEditor.value.rootEl, {
        // appendTo: document.body, // no wrapping, nicer background blur - but bad accessibility
        arrow: false,
        content: cmsTextEditorControls.value,
        interactive: true,
        hideOnClick: false,
        placement: "top-start",
        trigger: "manual",
        offset: [-4, 4],
        onCreate: () => cmsTextEditorControls.value.style.display = ""
      });
  }

  if (shown)
    tippyInstance.show();
  else
    tippyInstance.hide();
});

watch(realTextDisplay, (showRealText) => {
  if (showRealText && tippyInstance) {
    tippyInstance.destroy();
    tippyInstance = null;
  }
});
/* /CMS */
</script>

<template>
  <div v-if="realTextDisplay" class="text-wrapper" :class="class" v-i18n-html:[i18n.locale]="{ textModule: textModule, isMultiline: isMultiline }"></div>

  <!-- CMS -->
  <div v-else class="cms-text-editor-container" :class="class">
    <EditorContent class="text-wrapper cms-text-editor" :editor="editor" ref="cmsTextEditor" />

    <div class="cms-text-editor-controls" ref="cmsTextEditorControls" style="display: none;">
      <button class="editor-action editor-action-bold" data-editor-action @click="editorAction('bold')" @blur="checkShouldHideControls">B</button>
      <button class="editor-action editor-action-italics" data-editor-action @click="editorAction('italics')" @blur="checkShouldHideControls">I</button>
      <button class="editor-action editor-action-shy" data-editor-action @click="editorAction('shy')" @blur="checkShouldHideControls">&amp;shy;</button>
      <button class="editor-action" data-editor-action @click="editorAction('undo')" @blur="checkShouldHideControls">Undo</button>
      <button class="editor-action" data-editor-action @click="editorAction('redo')" @blur="checkShouldHideControls">Redo</button>
      <span aria-hidden="true" class="spinner-sm" :style="{opacity: [cmsTextSyncStatusValue.WRITING, cmsTextSyncStatusValue.SYNCING].indexOf(cmsTextSyncStatus) >= 0 ? 1 : 0}"></span>
    </div>
  </div>
  <!-- /CMS -->
</template>

<style>
/* CMS */
.cms-text-editor .ProseMirror {
  white-space: pre-wrap;
  outline: transparent solid 1px;
  outline-offset: 2px;
  transition: outline-color .15s ease-out;
}

.cms-text-editor .ProseMirror:focus-visible {
  outline-color: black;
}

.cms-text-editor .ProseMirror p.is-editor-empty:first-child:before {
  content: attr(data-placeholder);
  float: left;
  color: rgb(255 255 255 / 50%);
  pointer-events: none;
  height: 0;
  font-style: italic;
}

.cms-text-editor-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  height: auto;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.68);
  color: var(--color-white);
  border-radius: 0.4rem;
  backdrop-filter: blur(3px);
}

.cms-text-editor-controls button.editor-action {
  border: none;
  background: none;
}

.cms-text-editor-controls .editor-action-bold {
  font-weight: bold;
}

.cms-text-editor-controls .editor-action-italics {
  font-family: monospace;
  font-style: italic;
}

.cms-text-editor-controls .editor-action-shy {
  font-family: monospace;
}

.tippy-box {
  transition-duration: 0.15s !important;
  transition-timing-function: ease-out;
}

[data-tippy-root] {
  visibility: visible !important;
}
/* /CMS */
</style>