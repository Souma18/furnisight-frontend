<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { ADMIN_ICON_OPTIONS } from '../../config/adminIconOptions'

const props = defineProps({
  modelValue: { type: String, default: 'house' },
  options: { type: Array, default: () => [] },
  /** inline = một nửa hàng cạnh Trạng thái, giống mẫu HTML */
  variant: { type: String, default: 'default' },
})

const emit = defineEmits(['update:modelValue'])

const root = ref(null)
const open = ref(false)

const list = computed(() => (props.options.length ? props.options : ADMIN_ICON_OPTIONS))

const selected = computed(() => list.value.find((o) => o.id === props.modelValue) ?? list.value[0])

const isInline = computed(() => props.variant === 'inline')

function togglePanel() {
  open.value = !open.value
}

function select(id) {
  emit('update:modelValue', id)
  open.value = false
}

function onDocumentClick(event) {
  if (!open.value || !root.value) return
  if (!root.value.contains(event.target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div
    ref="root"
    class="icon-picker-root"
    :class="{ 'icon-picker-root--inline': isInline, 'mform-group': !isInline }"
  >
    <label class="mfl">{{ isInline ? 'Icon' : 'Icon danh mục' }}</label>
    <AppButton
      type="button"
      class="icon-picker-trigger"
      :class="{ open, 'icon-picker-trigger--inline': isInline }"
      @click.stop="togglePanel"
    >
      <span class="icon-picker-preview" :class="{ 'icon-picker-preview--inline': isInline }">
        <AppIcon v-if="selected" :name="selected.name" :size="isInline ? 20 : 18" />
      </span>
      <span v-if="!isInline" class="icon-picker-trigger-text">
        {{ selected?.label ?? 'Chọn icon' }}
      </span>
      <AppIcon name="chevronDown" :size="14" class="icon-picker-chevron" />
    </AppButton>

    <Transition name="icon-picker-drop">
      <div v-if="open" class="icon-picker-popover" :class="{ 'icon-picker-popover--inline': isInline }" @click.stop>
        <div v-if="!isInline" class="icon-picker-popover-title">Chọn icon danh mục</div>
        <div class="icon-picker-grid">
          <AppButton
            v-for="opt in list"
            :key="opt.id"
            type="button"
            class="icon-picker-item"
            :class="{ active: modelValue === opt.id }"
            :title="opt.label"
            @click="select(opt.id)"
          >
            <AppIcon :name="opt.name" :size="20" />
            <span class="icon-picker-item-label">{{ opt.label }}</span>
          </AppButton>
        </div>
      </div>
    </Transition>
  </div>
</template>
