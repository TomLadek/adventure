<script>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

/* CMS */
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { useCmsControlsStore } from '../../stores/cmscontrols';
/* /CMS */
</script>

<script setup>
const props = defineProps({
  locale: {
    required: true,
    type: String
  },
  textModule: {
    required: false,
    type: String
  }
});

const { t, locale } = useI18n();

const realTextDisplay = ref(true);

const finalText = computed(() => {
  let textTmp = getTranslatedText();
  
  if (textTmp.length === 0)
    return "";

  return /<p>.*<\/p>/.test(textTmp) ? textTmp : `<p>${textTmp}</p>`;
})

function getTranslatedText() {
  return props.textModule ? t(props.textModule) : "";
}

/* CMS */
const cmsControlsStore = useCmsControlsStore(),
      editorControlsShown = ref(false),
      cmsControlsPosition = ref({ top: 0, left: 0 }),
      syncStatusValue = { SYNCING: 0, SYNCED: 1 },
      syncStatus = ref(syncStatusValue.SYNCED);

let syncTimeout = 0;

const editor = useEditor({
  content: getTranslatedText(),
  extensions: [ StarterKit ],
  onBeforeCreate() {
    realTextDisplay.value = false;
  },
  onUpdate({ editor }) {
    syncStatus.value = syncStatusValue.SYNCING;

    clearTimeout(syncTimeout);

    syncTimeout = setTimeout(() => {
      console.log("saving following content:", editor.getHTML());

      cmsControlsStore.actionWithResult(cmsControlsStore.actions.EDIT_TEXT, {
        textModule: props.textModule, 
        locale: locale,
        newText: editor.getHTML()
      }).then((value) => {
        console.log("resolved", value);

        syncStatus.value = syncStatusValue.SYNCED;
  
        setTimeout(() => {
          if (!editor.isFocused)
            editorControlsShown.value = false;
        }, 3000);
  
        syncTimeout = 0;
      }).catch(reason => console.error(reason));
    }, 1000);
  },
  onFocus() {
    editorControlsShown.value = true;
  },
  onBlur() {
    if (syncStatus.value !== syncStatusValue.SYNCING)
      editorControlsShown.value = false;
  },
  onCreate({ editor }) {
    cmsControlsPosition.value.top = `${editor.view.dom.offsetTop}px`;
    cmsControlsPosition.value.left = `${editor.view.dom.offsetLeft}px`;
  }
});

watch(locale, () => {
  editor.value.commands.setContent(getTranslatedText())
})
/* /CMS */
</script>

<template>
  <div v-if="finalText" class="text-wrapper" v-html="finalText" v-show="realTextDisplay"></div>

  <!-- CMS -->
  <div class="cms-test-editor-container" v-show="!realTextDisplay">
    <EditorContent :editor="editor" class="cms-text-editor" />

    <div class="cms-text-editor-controls" v-show="editorControlsShown">
      <span>{{ syncStatus === syncStatusValue.SYNCING ? "syncing" : "synced" }}</span>
    </div>
  </div>
  <!-- /CMS -->
</template>

<style>
.text-wrapper {
  position: relative;
}

/* CMS */
.cms-text-editor .ProseMirror {
  white-space: pre-wrap;
}

.cms-text-editor .ProseMirror:focus-visible {
  outline-style: double;
  outline-offset: -1px;
}

.cms-test-editor-container .cms-text-editor-controls {
  position: fixed;
  top: v-bind("cmsControlsPosition.top");
  left: v-bind("cmsControlsPosition.left");
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  height: 2rem;
  padding: 0.5rem;
  background: white;
  color: black;
  border-radius: 0.4rem;
  transform: translateY(-100%);
}
/* /CMS */
</style>