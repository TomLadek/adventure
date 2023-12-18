<script>
import { ref, computed } from 'vue';
import { useVI18nHtml } from '../composables/vI18nHtml.js';

/* CMS */
import { watch } from 'vue'; 
import { useEditor, EditorContent } from '@tiptap/vue-3';
import tippy from 'tippy.js';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

import { useCmsControlsStore } from '../stores/cmscontrols.js';
import { useLinksStore } from '../stores/links.js';
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
const emit = defineEmits(["focus", "blur", "save"]);

const cmsControlsStore = useCmsControlsStore(),
      linksStore = useLinksStore(),
      cmsTextEditor = ref(null),
      cmsTextEditorControls = ref(null),
      cmsTextSyncStatusValue = { WRITING: 0, SYNCING: 1, SYNCED: 2, ERROR: 3 },
      cmsTextSyncStatus = ref(cmsTextSyncStatusValue.SYNCED),
      statusVisible = ref(false),
      editorReady = ref(false),
      undoAvailable = ref(false),
      redoAvailable = ref(false),
      translationAvailable = ref(false),
      selectedText = ref(""),
      editor = useEditor({
        extensions: [
          StarterKit,
          Placeholder.configure({
            placeholder: props.emptyPlaceholder || "Empty",
          }),
          Link.configure({
            openOnClick: false,
            HTMLAttributes: {
              rel: "noreferrer",
              external: "",
            }
          })
        ],
        content: translatedText.value,
        onBeforeCreate() {
          editorReady.value = true;
        },
        onCreate({ editor} ) {
          checkHasContent(editor);
        },
        onUpdate({ editor }) {
          checkHasContent(editor);
          saveText(editor);
        },
        onFocus() {
          emit("focus");
          toggleEditorControls(true);
        },
        onBlur() {
          emit("blur");
          checkShouldHideControls();
        },
        onSelectionUpdate({ editor, transaction}) {
          selectedText.value = editor.view.state.doc.textBetween(transaction.curSelection.$anchor.pos, transaction.curSelection.$head.pos);
        }
      });

let cmsTextSyncTimeout = 0,
    statusVisibilityTimeout = 0,
    tippyInstance, editorElementResizeObserver;

function saveText(editor) {
  cmsTextSyncStatus.value = cmsTextSyncStatusValue.WRITING;
  statusVisible.value = true;

  undoAvailable.value = editor.can().undo();
  redoAvailable.value = editor.can().redo();

  clearTimeout(cmsTextSyncTimeout);
  clearTimeout(statusVisibilityTimeout);

  cmsTextSyncTimeout = setTimeout(() => {
    emit("save");

    cmsTextSyncStatus.value = cmsTextSyncStatusValue.SYNCING;

    cmsControlsStore.actionWithResult(cmsControlsStore.actions.EDIT_TEXT, {
      textModule: props.textModule,
      locale: props.i18n.locale,
      newText: processContent(editor.getHTML())
    }).then(() => {
      cmsTextSyncStatus.value = cmsTextSyncStatusValue.SYNCED;
      statusVisibilityTimeout = setTimeout(() => statusVisible.value = false, 1500);
    }).catch(reason => {
      console.error(reason)
      cmsTextSyncStatus.value = cmsTextSyncStatusValue.ERROR;
      statusVisible.value = true;
    }).finally(() => {
      checkShouldHideControls();
      cmsTextSyncTimeout = 0;        
    });
  }, 1000);
}

function checkHasContent(editor) {
  if (editor.getText().trim() === "") {
    translationAvailable.value = false;
  } else {
    translationAvailable.value = true;
  }
}

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
      toggleEditorControls(false);
  }, 100);
}

async function editorAction(type) {
  switch (type) {
    case "bold":
      editor.value.chain().focus().toggleBold().run();
      break;
    case "italics":
      editor.value.chain().focus().toggleItalic().run();
      break;
    case "undo":
      editor.value.chain().focus().undo().run();
      break;
    case "redo":
      editor.value.chain().focus().redo().run();
      break;
    case "shy":
      editor.value.chain().focus().insertContent(String.fromCodePoint(0x00AD) /* &shy; */).run();
      break;
    case "link":
      const oldLinkHref = editor.value.getAttributes('link').href;

      // If the cursor is at a link, select the whole link
      if (oldLinkHref)
        editor.value.chain().focus().extendMarkRange('link').run();

      linksStore.getLink(selectedText.value, oldLinkHref, (newLinkText, newLinkTextSuggested, newLinkHref) => {
        newLinkHref = (newLinkHref || "").trim();

        // Begin command chain
        const chainedCommands = editor.value.chain().focus();

        // If no href was input
        if (newLinkHref === "") {
          if (oldLinkHref !== "") {
            // Href was cleared from a previous non-empty value
            chainedCommands
              .extendMarkRange('link')
              .unsetLink();
          }

          chainedCommands.run();
          saveText(editor.value);
          return;
        }

        // If no text was input, set the text to be the href itself
        if (!newLinkText || newLinkText.trim() === "")
          newLinkText = newLinkTextSuggested;

        if (selectedText.value.trim() === "") {
          // When no text was selected we need to insert the new link text and then select it
          const insertStart = editor.value.state.selection.$anchor.pos,
                insertEnd = insertStart + newLinkText.length;

          chainedCommands
            .insertContentAt(insertStart, newLinkText, { updateSelection: true })
            .setTextSelection({ from: insertStart, to: insertEnd });
        } else {
          // Some text was selected
          if (selectedText.value !== newLinkText) {
            // If the selected text doesn't match the input link text, replace it
            const insertStart = editor.value.state.selection.$anchor.pos,
                  insertEnd = insertStart + newLinkText.length;

            chainedCommands
              .insertContentAt({ from: insertStart, to: editor.value.state.selection.$head.pos}, newLinkText, { updateSelection: true })
              .setTextSelection({ from: insertStart, to: insertEnd });
          }

          // In case the selection was already a link we want to select it fully
          chainedCommands
            .extendMarkRange('link');
        }

        // Actually set the link to the input href
        chainedCommands
          .setLink({
            href: newLinkHref,
            target: /^[#?]/.test(newLinkHref) /* does link begin with '?' or '#'? */
                      ? null /* yes -> remove default target */
                      : undefined /* no -> keep default target (_blank) */
          })
          .run();
        saveText(editor.value);
      });

      break;
    case "translate":
      const textToTranslate = editor.value.view.dom.innerText;

      try {
        const translation = await cmsControlsStore.actionWithResult(cmsControlsStore.actions.TRANSLATE_TEXT, { text: textToTranslate, targetLocale: props.i18n.locale })

        editor.value.commands.setContent(translation.split("\r\n\r\n").map(r => `<p>${r}</p>`).join(""));

        saveText(editor.value);
      } catch (ex) {
        console.error(ex)
      }

      break;
  }
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

function toggleEditorControls(shown) {
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

  if (shown) {
    tippyInstance.show();

    if (!editorElementResizeObserver) {
      // Fixes an issue with the tippy tooltip not repositioning when its anchor element resizes
      editorElementResizeObserver = new ResizeObserver(() => {
        if (tippyInstance) {
          tippyInstance.hide();
          tippyInstance.show();
        }
      });

      editorElementResizeObserver.observe(cmsTextEditor.value.rootEl);
    }

    cmsTextEditor.value.rootEl.addEventListener("keyup", event => {
      if (event.key === "Escape")
        editor.value.commands.blur();
    });
  } else {
    tippyInstance.hide();

    if (editorElementResizeObserver) {
      editorElementResizeObserver.disconnect();
      editorElementResizeObserver = null;
    }

    cmsTextEditor.value.rootEl.removeEventListeners("keyup");
  }
}

realTextDisplay = computed(() => !cmsControlsStore.editMode || !editorReady.value);

watch(() => props.i18n.locale, () => editor.value.commands.setContent(translatedText.value));
watch(() => props.textModule, () => editor.value.commands.setContent(translatedText.value));

if (props.focusAction)
  watch(props.focusAction, () => editor.value.commands.focus());

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
      <ul class="editor-actions-container">
        <li>
          <button class="editor-action editor-action-bold" data-editor-action @click="editorAction('bold')" @blur="checkShouldHideControls" title="Bold">B</button>
        </li>
        <li>
          <button class="editor-action editor-action-italics" data-editor-action @click="editorAction('italics')" @blur="checkShouldHideControls" title="Italic">I</button>
        </li>
        <li>
          <button class="editor-action editor-action-shy" data-editor-action @click="editorAction('shy')" @blur="checkShouldHideControls" title="Soft hyphen">&amp;shy;</button>
        </li>
        <li>
          <button class="editor-action editor-action-link" data-editor-action @click="editorAction('link')" @blur="checkShouldHideControls" title="Link"><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 0 640 512" fill="white"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg></button>
        </li>
        <li>
          <button class="editor-action editor-action-translate" :disabled="!translationAvailable" data-editor-action @click="editorAction('translate')" @blur="checkShouldHideControls" title="Auto-translate">
            <span>{{ i18n.locale }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="1em" height="1em" viewBox="0 0 32 32">
              <g>
                <path d="M18,11a1,1,0,0,1-1,1,5,5,0,0,0-5,5,1,1,0,0,1-2,0,5,5,0,0,0-5-5,1,1,0,0,1,0-2,5,5,0,0,0,5-5,1,1,0,0,1,2,0,5,5,0,0,0,5,5A1,1,0,0,1,18,11Z"/>
                <path d="M19,24a1,1,0,0,1-1,1,2,2,0,0,0-2,2,1,1,0,0,1-2,0,2,2,0,0,0-2-2,1,1,0,0,1,0-2,2,2,0,0,0,2-2,1,1,0,0,1,2,0,2,2,0,0,0,2,2A1,1,0,0,1,19,24Z"/>
                <path d="M28,17a1,1,0,0,1-1,1,4,4,0,0,0-4,4,1,1,0,0,1-2,0,4,4,0,0,0-4-4,1,1,0,0,1,0-2,4,4,0,0,0,4-4,1,1,0,0,1,2,0,4,4,0,0,0,4,4A1,1,0,0,1,28,17Z"/>
              </g>
            </svg>
          </button>
        </li>
        <li>
          <button class="editor-action editor-action-undo" :disabled="!undoAvailable" data-editor-action @click="editorAction('undo')" @blur="checkShouldHideControls" title="Undo"><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 0 512 512" fill="white"><path d="M48.5 224H40c-13.3 0-24-10.7-24-24V72c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2L98.6 96.6c87.6-86.5 228.7-86.2 315.8 1c87.5 87.5 87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3c-62.2-62.2-162.7-62.5-225.3-1L185 183c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8H48.5z"/></svg></button>
        </li>
        <li>
          <button class="editor-action editor-action-redo" :disabled="!redoAvailable" data-editor-action @click="editorAction('redo')" @blur="checkShouldHideControls" title="Redo"><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 0 512 512" fill="white"><path d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"/></svg></button>
        </li>
      </ul>

      <Transition name="status-fade">
        <div class="editor-status-container" v-if="statusVisible">
          <span v-if="[cmsTextSyncStatusValue.WRITING, cmsTextSyncStatusValue.SYNCING].indexOf(cmsTextSyncStatus) >= 0" class="editor-status status-syncing spinner-sm" title="Syncing in progress ..."></span>
          <span v-else-if="cmsTextSyncStatus === cmsTextSyncStatusValue.ERROR" class="editor-status status-error" title="Sync error!">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="white"><path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>
          </span>
          <span v-else class="editor-status status-ok" title="Synced successfully">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="white"><path d="M342.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 178.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l80 80c12.5 12.5 32.8 12.5 45.3 0l160-160zm96 128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 402.7 54.6 297.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l256-256z"/></svg>
          </span>
        </div>
      </Transition>
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

.cms-text-editor .ProseMirror:not(:focus-visible):hover {
  outline-color: #858585;
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
  align-items: center;
  gap: 0.25rem;
  height: auto;
  color: var(--color-white);
}

.cms-text-editor-controls .editor-actions-container {
  height: auto;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  background: rgba(0, 0, 0, 0.68);
  border-radius: 0.4rem;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.cms-text-editor-controls .editor-actions-container li {
  list-style: none;
}

.cms-text-editor-controls .editor-status-container {
  height: 2rem;
  width: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cms-text-editor-controls button.editor-action {
  min-width: 1.6rem;
  height: 2rem;
  display: flex;
  border: none;
  background: none;
  padding: 0 0.3rem;
  align-items: center;
  justify-content: center;
}

.cms-text-editor-controls button.editor-action[disabled] {
  opacity: 0.25;
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

.cms-text-editor-controls .editor-action-translate span {
  transform: scale(0.8) translate(1px, 2px);
}

.cms-text-editor-controls .editor-action-translate svg {
  transform: translate(-5px, -4px);
}

.cms-text-editor-controls .editor-status {
  display: flex;
  justify-content: center;
  width: 1rem;
  height: 1rem;
}

.cms-text-editor-controls .editor-status.status-syncing {
  box-sizing: border-box;
}

.cms-text-editor-controls .editor-status.status-ok {
  opacity: 0.7;
}

.cms-text-editor-controls .editor-status.status-error svg {
  fill: #ff9400;
}

.cms-text-editor-container .tippy-box {
  transition-duration: 0.15s !important;
  transition-timing-function: ease-out;
}

/* TODO Is this still necessary? */
.cms-text-editor-container [data-tippy-root] {
  visibility: visible !important;
}

.cms-text-editor-controls .status-fade-enter-active,
.cms-text-editor-controls .status-fade-leave-active {
  transition: opacity 0.15s ease;
}

.cms-text-editor-controls .status-fade-enter-from,
.cms-text-editor-controls .status-fade-leave-to {
  opacity: 0;
}
/* /CMS */
</style>