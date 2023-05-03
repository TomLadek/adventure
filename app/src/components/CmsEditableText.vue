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
  },
  class: {
    type: String,
    required: false
  }
});

let realTextDisplay = true;

const translatedText = computed(() => props.textModule ? props.i18n.t(props.textModule) : "");

const sanitizedTranslatedText = computed(() => {
  const textTmp = translatedText.value;

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
      cmsTextSyncStatusValue = { WRITING: 0, SYNCING: 1, SYNCED: 2, ERROR: 3 },
      cmsTextSyncStatus = ref(cmsTextSyncStatusValue.SYNCED),
      editorReady = ref(false);

realTextDisplay = computed(() => !cmsControlsStore.editMode || !editorReady.value)

let cmsTextSyncTimeout = 0;

const editor = useEditor({
  extensions: [ StarterKit ],
  content: translatedText.value,
  onBeforeCreate() {
    editorReady.value = true;
  },
  onCreate() {
  },
  onUpdate({ editor }) {
    cmsTextSyncStatus.value = cmsTextSyncStatusValue.WRITING;

    clearTimeout(cmsTextSyncTimeout);

    cmsTextSyncTimeout = setTimeout(() => {
      cmsTextSyncStatus.value = cmsTextSyncStatusValue.SYNCING;

      cmsControlsStore.actionWithResult(cmsControlsStore.actions.EDIT_TEXT, {
        textModule: props.textModule,
        locale: props.i18n.locale,
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
      }, 100);
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

watch(() => props.i18n.locale, () => editor.value.commands.setContent(translatedText.value));

if (props.focusAction)
  watch(props.focusAction, () => editor.value.commands.focus());
/* /CMS */
</script>

<template>
  <div v-if="realTextDisplay" class="text-wrapper" :class="class" v-html="sanitizedTranslatedText"></div>

  <!-- CMS -->
  <div v-else class="cms-text-editor-container" :class="class">
    <EditorContent class="text-wrapper cms-text-editor" :editor="editor" />
    
    <div class="cms-text-editor-controls" v-show="cmsEditorControlsShown">
      <button class="editor-action editor-action-bold" @click="editorAction('bold')">B</button>
      <button class="editor-action editor-action-italics" @click="editorAction('italics')">I</button>
      <button class="editor-action" @click="editorAction('undo')">Undo</button>
      <button class="editor-action" @click="editorAction('redo')">Redo</button>
      <span class="spinner-sm" :style="{visibility: [cmsTextSyncStatusValue.WRITING, cmsTextSyncStatusValue.SYNCING].indexOf(cmsTextSyncStatus) >= 0 ? 'visible' : 'hidden'}"></span>
    </div>
  </div>
  <!-- /CMS -->
</template>

<style>
.text-wrapper {
  max-height: 10rem;
  overflow-y: auto;
}

@media (min-height: 525px) {
  .text-wrapper {
    max-height: 14rem;
  }
}

@media (min-height: 744px) {
  .text-wrapper {
    max-height: 20rem;
  }
}

/* CMS */
.cms-text-editor-container {
  position: relative;
}

.cms-text-editor .ProseMirror {
  white-space: pre-wrap;
}

.cms-text-editor .ProseMirror:focus-visible {
  outline-style: double;
  outline-offset: -1px;
}

.cms-text-editor-container .cms-text-editor-controls {
  position: absolute;
  top: 0;
  left: 0;
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

.cms-text-editor-container .cms-text-editor-controls button.editor-action {
  color: inherit;
  border: none;
  background: none;
}

.cms-text-editor-container .cms-text-editor-controls .editor-action-bold {
  font-weight: bold;
}

.cms-text-editor-container .cms-text-editor-controls .editor-action-italics {
  font-family: monospace;
  font-style: italic;
}
/* /CMS */
</style>