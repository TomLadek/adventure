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
  },
  editorControlsPosition: {
    type: String,
    required: false
  }
});

let realTextDisplay = true;

const translatedText = computed(() => props.textModule ? props.i18n.t(props.textModule) : "");

const cssPositions = computed(() => {
  if (props.editorControlsPosition === "fixed") {
    return {
      container: "initial",
      editorControls: "fixed"
    }
  } else {
    return {
      container: "relative",
      editorControls: "absolute"
    }
  }
})

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
      cmsControlsPosition = ref({ top: 0, left: 0 }),
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
  onCreate({ editor }) {
    if (props.editorControlsPosition === "fixed") {
      cmsControlsPosition.value.top = `${editor.view.dom.offsetTop}px`;
      cmsControlsPosition.value.left = `${editor.view.dom.offsetLeft}px`;
    } else {
      cmsControlsPosition.value.top = 0;
      cmsControlsPosition.value.left = 0;
    }
  },
  onUpdate({ editor }) {
    cmsTextSyncStatus.value = cmsTextSyncStatusValue.WRITING;

    clearTimeout(cmsTextSyncTimeout);

    cmsTextSyncTimeout = setTimeout(() => {
      cmsTextSyncStatus.value = cmsTextSyncStatusValue.SYNCING;

      cmsControlsStore.actionWithResult(cmsControlsStore.actions.EDIT_TEXT, {
        textModule: props.textModule,
        locale: props.i18n.locale,
        newText: editor.getHTML().replace(String.fromCodePoint(0x00AD), "&shy;")
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
    case "shy":
      editor.value.commands.insertContent(String.fromCodePoint(0x00AD) /* &shy; */);
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
    
    <Transition name="editor-controls-fade">
      <div v-show="cmsEditorControlsShown" class="cms-text-editor-controls">
        <button class="editor-action editor-action-bold" @click="editorAction('bold')">B</button>
        <button class="editor-action editor-action-italics" @click="editorAction('italics')">I</button>
        <button class="editor-action editor-action-shy" @click="editorAction('shy')">&amp;shy;</button>
        <button class="editor-action" @click="editorAction('undo')">Undo</button>
        <button class="editor-action" @click="editorAction('redo')">Redo</button>
        <span aria-hidden="true" class="spinner-sm" :style="{opacity: [cmsTextSyncStatusValue.WRITING, cmsTextSyncStatusValue.SYNCING].indexOf(cmsTextSyncStatus) >= 0 ? 1 : 0}"></span>
      </div>
    </Transition>
  </div>
  <!-- /CMS -->
</template>

<style>
/* CMS */
.cms-text-editor-container {
  position: v-bind("cssPositions.container");
}

.cms-text-editor .ProseMirror {
  white-space: pre-wrap;
  outline: transparent solid 1px;
  outline-offset: -1px;
  transition: outline-color .15s ease-out;
}

.cms-text-editor .ProseMirror:focus-visible {
  outline-color: black;
}

.cms-text-editor-container .cms-text-editor-controls {
  position: v-bind("cssPositions.editorControls");
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

.cms-text-editor-container .cms-text-editor-controls .editor-action-shy {
  font-family: monospace;
}

.editor-controls-fade-enter-active, .editor-controls-fade-leave-active {
  transition: opacity 0.15s ease-out;
}

.editor-controls-fade-enter-from,
.editor-controls-fade-leave-to {
  opacity: 0;
}
/* /CMS */
</style>