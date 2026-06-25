<script setup>
import { ref, watch } from 'vue'
import TemplateListModal from './TemplateListModal.vue'
import TemplateFormModal from './TemplateFormModal.vue'

const props = defineProps({
  manager: {
    type: Object,
    required: true,
  },
  isOpen: Boolean,
  defaultEditing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'use-template'])
const mgr = props.manager

const listOpen = ref(false)
const formOpen = ref(false)
const editingData = ref(null)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.defaultEditing) {
        openForm(null)
        listOpen.value = false
      } else {
        listOpen.value = true
        formOpen.value = false
      }
    } else {
      listOpen.value = false
      formOpen.value = false
    }
  }
)

function closeAll() {
  listOpen.value = false
  formOpen.value = false
  emit('close')
}

function closeForm() {
  formOpen.value = false
  if (props.defaultEditing) {
    emit('close')
  }
}

function openForm(templateData = null) {
  editingData.value = templateData ? {
    id: templateData.id,
    title: templateData.title,
    content: templateData.content,
    category: templateData.category,
    active: templateData.active !== false,
  } : null
  formOpen.value = true
}

function useTemplate(content) {
  emit('use-template', content)
  closeAll()
}
</script>

<template>
  <Teleport to="body">
    <TemplateListModal 
      v-if="listOpen" 
      :is-open="listOpen" 
      :manager="mgr" 
      @close="closeAll"
      @use-template="useTemplate"
      @edit-template="openForm"
      @add-template="openForm(null)"
    />

    <TemplateFormModal 
      v-if="formOpen"
      :is-open="formOpen"
      :manager="mgr"
      :initial-data="editingData"
      @close="closeForm"
    />
  </Teleport>
</template>
