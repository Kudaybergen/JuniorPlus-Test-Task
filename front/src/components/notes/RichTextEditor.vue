<template>
  <div class="rich-text-editor">
    <!-- Toolbar -->
    <div class="editor-toolbar">
      <q-btn-group spread>
        <!-- Text Formatting -->
        <q-btn
          flat
          dense
          icon="format_bold"
          :color="editor?.isActive('bold') ? 'primary' : 'grey-7'"
          @click="editor?.chain().focus().toggleBold().run()"
          :disable="!editor"
        >
          <q-tooltip>Bold</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="format_italic"
          :color="editor?.isActive('italic') ? 'primary' : 'grey-7'"
          @click="editor?.chain().focus().toggleItalic().run()"
          :disable="!editor"
        >
          <q-tooltip>Italic</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="format_underlined"
          :color="editor?.isActive('underline') ? 'primary' : 'grey-7'"
          @click="editor?.chain().focus().toggleUnderline().run()"
          :disable="!editor"
        >
          <q-tooltip>Underline</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="strikethrough_s"
          :color="editor?.isActive('strike') ? 'primary' : 'grey-7'"
          @click="editor?.chain().focus().toggleStrike().run()"
          :disable="!editor"
        >
          <q-tooltip>Strikethrough</q-tooltip>
        </q-btn>

        <q-separator vertical />

        <!-- Headings -->
        <q-btn-dropdown
          flat
          dense
          icon="title"
          :color="isHeadingActive ? 'primary' : 'grey-7'"
          :disable="!editor"
        >
          <q-list>
            <q-item
              clickable
              v-close-popup
              @click="editor?.chain().focus().setParagraph().run()"
              :class="{ 'text-primary': editor?.isActive('paragraph') }"
            >
              <q-item-section>Normal Text</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
              :class="{ 'text-primary': editor?.isActive('heading', { level: 1 }) }"
            >
              <q-item-section class="text-h5">Heading 1</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
              :class="{ 'text-primary': editor?.isActive('heading', { level: 2 }) }"
            >
              <q-item-section class="text-h6">Heading 2</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
              :class="{ 'text-primary': editor?.isActive('heading', { level: 3 }) }"
            >
              <q-item-section class="text-subtitle1">Heading 3</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-separator vertical />

        <!-- Lists -->
        <q-btn
          flat
          dense
          icon="format_list_bulleted"
          :color="editor?.isActive('bulletList') ? 'primary' : 'grey-7'"
          @click="editor?.chain().focus().toggleBulletList().run()"
          :disable="!editor"
        >
          <q-tooltip>Bullet List</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="format_list_numbered"
          :color="editor?.isActive('orderedList') ? 'primary' : 'grey-7'"
          @click="editor?.chain().focus().toggleOrderedList().run()"
          :disable="!editor"
        >
          <q-tooltip>Numbered List</q-tooltip>
        </q-btn>

        <q-separator vertical />

        <!-- Quotes and Code -->
        <q-btn
          flat
          dense
          icon="format_quote"
          :color="editor?.isActive('blockquote') ? 'primary' : 'grey-7'"
          @click="editor?.chain().focus().toggleBlockquote().run()"
          :disable="!editor"
        >
          <q-tooltip>Quote</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="code"
          :color="editor?.isActive('code') ? 'primary' : 'grey-7'"
          @click="editor?.chain().focus().toggleCode().run()"
          :disable="!editor"
        >
          <q-tooltip>Inline Code</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="integration_instructions"
          :color="editor?.isActive('codeBlock') ? 'primary' : 'grey-7'"
          @click="editor?.chain().focus().toggleCodeBlock().run()"
          :disable="!editor"
        >
          <q-tooltip>Code Block</q-tooltip>
        </q-btn>

        <q-separator vertical />

        <!-- Utilities -->
        <q-btn
          flat
          dense
          icon="horizontal_rule"
          @click="editor?.chain().focus().setHorizontalRule().run()"
          :disable="!editor"
        >
          <q-tooltip>Horizontal Rule</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="undo"
          @click="editor?.chain().focus().undo().run()"
          :disable="!editor || !editor.can().undo()"
        >
          <q-tooltip>Undo</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="redo"
          @click="editor?.chain().focus().redo().run()"
          :disable="!editor || !editor.can().redo()"
        >
          <q-tooltip>Redo</q-tooltip>
        </q-btn>
      </q-btn-group>
    </div>

    <!-- Editor Content -->
    <div
      ref="editorElement"
      class="editor-content"
      :class="{ 'editor-focused': isFocused }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'

interface Props {
  modelValue: string
  placeholder?: string
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Start writing...',
  editable: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'focus': []
  'blur': []
}>()

const editorElement = ref()
const editor = ref<Editor>()
const isFocused = ref(false)

const isHeadingActive = computed(() => {
  return editor.value?.isActive('heading', { level: 1 }) ||
         editor.value?.isActive('heading', { level: 2 }) ||
         editor.value?.isActive('heading', { level: 3 })
})

onMounted(() => {
  editor.value = new Editor({
    element: editorElement.value,
    extensions: [
      StarterKit,
      Typography,
      Placeholder.configure({
        placeholder: props.placeholder,
        considerAnyAsEmpty: true
      })
    ],
    content: props.modelValue,
    editable: props.editable,
    onUpdate: ({ editor }) => {
      emit('update:modelValue', editor.getHTML())
    },
    onFocus: () => {
      isFocused.value = true
      emit('focus')
    },
    onBlur: () => {
      isFocused.value = false
      emit('blur')
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

// Watch for external content changes
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue, false)
  }
})

// Watch for editable changes
watch(() => props.editable, (newValue) => {
  if (editor.value) {
    editor.value.setEditable(newValue)
  }
})

// Expose editor instance
defineExpose({
  editor: computed(() => editor.value),
  focus: () => editor.value?.commands.focus(),
  blur: () => editor.value?.commands.blur()
})
</script>

<style lang="sass" scoped>
.rich-text-editor
  border: 1px solid $grey-4
  border-radius: 4px
  overflow: hidden

  &:focus-within
    border-color: $primary

.editor-toolbar
  background: $grey-2
  border-bottom: 1px solid $grey-4
  padding: 8px

.editor-content
  min-height: 200px
  
  &.editor-focused
    background: rgba(25, 118, 210, 0.02)

:deep(.ProseMirror)
  outline: none
  min-height: 200px
  padding: 16px

  // Placeholder styles
  p.is-editor-empty:first-child::before
    content: attr(data-placeholder)
    float: left
    color: $grey-6
    pointer-events: none
    height: 0

  // Typography styles
  h1, h2, h3
    font-weight: 600
    line-height: 1.3
    margin-top: 1em
    margin-bottom: 0.5em

  h1
    font-size: 1.75em

  h2
    font-size: 1.5em

  h3
    font-size: 1.25em

  p
    margin: 0.5em 0

  ul, ol
    margin: 0.5em 0
    padding-left: 1.5em

  blockquote
    border-left: 4px solid $grey-4
    margin: 1em 0
    padding-left: 1em
    color: $grey-7
    font-style: italic

  code
    background: $grey-3
    padding: 0.2em 0.4em
    border-radius: 3px
    font-family: 'Courier New', Courier, monospace

  pre
    background: $grey-2
    padding: 1em
    border-radius: 4px
    overflow-x: auto
    margin: 1em 0

    code
      background: none
      padding: 0

  hr
    border: none
    border-top: 1px solid $grey-4
    margin: 1.5em 0

  // List item spacing
  li
    margin: 0.25em 0

  // Strong and emphasis
  strong
    font-weight: 600

  em
    font-style: italic
</style>
