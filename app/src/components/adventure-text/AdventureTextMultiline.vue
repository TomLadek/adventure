<script>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

/* CMS */
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
/* /CMS */
</script>

<script setup>
const props = defineProps({
  locale: {
    required: true,
    type: String
  },
  text: {
    required: false,
    type: String
  }
});

const { t } = useI18n();

const realTextDisplay = ref(true);

const finalText = computed(() => {
  let textTmp = t(props.text);
  
  if (textTmp.length === 0)
    return "";

  return /<p>.*<\/p>/.test(textTmp) ? textTmp : `<p>${textTmp}</p>`;
})

/* CMS */
const editor = useEditor({
  content: t(props.text),
  extensions: [ StarterKit ],
  onBeforeCreate() {
    realTextDisplay.value = false
  },
  onUpdate({ editor }) {
    // console.log(editor.getHTML())
  }
});
/* /CMS */
</script>

<template>
  <div v-if="finalText" class="text-wrapper" v-html="finalText" v-show="realTextDisplay"></div>

  <!-- CMS -->
  <EditorContent :editor="editor" class="cms-text-editor" />
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
/* /CMS */
</style>