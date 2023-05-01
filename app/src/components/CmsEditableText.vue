<script>
import { ref, computed } from 'vue';

/* CMS */
import { watch } from 'vue'; 
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

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
  }
});

const { t, locale } = props.i18n,
      realTextDisplay = ref(true);

function getTranslatedText() {
  return props.textModule ? t(props.textModule) : "";
}

const finalText = computed(() => {
  const textTmp = getTranslatedText();

  if (!props.isMultiline)
    return textTmp;
  
  if (textTmp.length === 0)
    return "";

  return /<p>.*<\/p>/.test(textTmp) ? textTmp : `<p>${textTmp}</p>`;
});


/* CMS */
const emit = defineEmits(["blur"]);

const cmsControlsStore = useCmsControlsStore(),
      cmsEditorControlsShown = ref(false),
      cmsControlsPosition = ref({ top: 0, left: 0 }),
      cmsTextSyncStatusValue = { WRITING: 0, SYNCING: 1, SYNCED: 2, ERROR: 3 },
      cmsTextSyncStatus = ref(cmsTextSyncStatusValue.SYNCED);

let cmsTextSyncTimeout = 0;

const editor = useEditor({
  extensions: [ StarterKit ],
  content: getTranslatedText(),
  onBeforeCreate() {
    realTextDisplay.value = false;
  },
  onCreate({ editor }) {
    cmsControlsPosition.value.top = `${editor.view.dom.offsetTop}px`;
    cmsControlsPosition.value.left = `${editor.view.dom.offsetLeft}px`;
  },
  onUpdate({ editor }) {
    cmsTextSyncStatus.value = cmsTextSyncStatusValue.WRITING;

    clearTimeout(cmsTextSyncTimeout);

    cmsTextSyncTimeout = setTimeout(() => {
      cmsTextSyncStatus.value = cmsTextSyncStatusValue.SYNCING;

      cmsControlsStore.actionWithResult(cmsControlsStore.actions.EDIT_TEXT, {
        textModule: props.textModule,
        locale: locale,
        newText: editor.getHTML()
      }).then(() => {
        cmsTextSyncStatus.value = cmsTextSyncStatusValue.SYNCED;
      }).catch(reason => {
        console.error(reason)
        cmsTextSyncStatus.value = cmsTextSyncStatusValue.ERROR;  
      }).finally(() => {
        setTimeout(() => {
          if (!editor.isFocused)
            cmsEditorControlsShown.value = false;
        }, 3000);

        cmsTextSyncTimeout = 0;        
      });
    }, 1000);
  },
  onFocus() {
    cmsEditorControlsShown.value = true;
  },
  onBlur({ editor }) {
    emit("blur");

    if ([cmsTextSyncStatusValue.WRITING, cmsTextSyncStatusValue.SYNCING].indexOf(cmsTextSyncStatus.value) < 0) {
      setTimeout(() => {
        if (!editor.isFocused)
          cmsEditorControlsShown.value = false;
      }, 500);
    }
  }
});

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
  }

  editor.value.commands.focus();
}

watch(() => props.textModule, newContent => editor.value.commands.setContent(newContent));

if (props.focusAction)
  watch(props.focusAction, () => editor.value.commands.focus());
/* /CMS */
</script>

<template>
  <div v-if="finalText" class="text-wrapper" v-html="finalText" v-show="realTextDisplay"></div>

  <!-- CMS -->
  <div class="cms-text-editor-container" v-show="!realTextDisplay">
    <EditorContent class="cms-text-editor" :editor="editor" />
    
    <div class="cms-text-editor-controls" v-show="cmsEditorControlsShown">
      <button class="editor-action editor-action-bold" @click="editorAction('bold')">B</button>
      <button class="editor-action editor-action-italics" @click="editorAction('italics')">I</button>
      <button class="editor-action" @click="editorAction('undo')">Undo</button>
      <button class="editor-action" @click="editorAction('redo')">Redo</button>
      <span class="spinner" :style="{visibility: [cmsTextSyncStatusValue.WRITING, cmsTextSyncStatusValue.SYNCING].indexOf(cmsTextSyncStatus) >= 0 ? 'visible' : 'hidden'}"></span>
    </div>
  </div>
  <!-- /CMS -->
</template>

<style>
/* CMS */
.cms-text-editor .ProseMirror {
  white-space: pre-wrap;
}

.cms-text-editor .ProseMirror:focus-visible {
  outline-style: double;
  outline-offset: -1px;
}

.cms-text-editor-container .cms-text-editor-controls {
  position: fixed;
  top: v-bind("cmsControlsPosition.top");
  left: v-bind("cmsControlsPosition.left");
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  height: auto;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.68);
  color: white;
  border-radius: 0.4rem;
  transform: translateY(-100%);
  backdrop-filter: blur(3px);
}

button.editor-action {
  color: inherit;
  border: none;
  background: none;
}

.editor-action-bold {
  font-weight: bold;
}

.editor-action-italics {
  font-family: monospace;
  font-style: italic;
}

.spinner {
  display: block;
  height: 15px;
  width: 15px;
  position: relative;
  -webkit-animation: rotation .7s infinite linear;
  -moz-animation: rotation .7s infinite linear;
  -o-animation: rotation .7s infinite linear;
  animation: rotation .7s infinite linear;
  border: 3px solid #c7c7c7;
  border-radius: 100%;
}

.spinner:before {
  content: "";
  display: block;
  position: absolute;
  left: -3px;
  top: -3px;
  height: 100%;
  width: 100%;
  border-top: 3px solid white;
  border-left: 3px solid transparent;
  border-bottom: 3px solid transparent;
  border-right: 0px solid transparent;
  border-radius: 100%;
}

@keyframes rotation {
  from { transform: rotate(0deg); }
  to { transform: rotate(359deg); }
}
/* /CMS */
</style>