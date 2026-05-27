<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'

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

const formModalOpen = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const filterCategory = ref('all')

const emptyForm = () => ({
  id: null,
  title: '',
  content: '',
  category: 'GREETING',
  active: true,
})
const currentForm = ref(emptyForm())

const categories = mgr.templateCategories

const categoryLabelMap = computed(() => {
  const map = {}
  categories.forEach((c) => {
    map[c.value] = c.label
  })
  return map
})

function categoryLabel(value) {
  return categoryLabelMap.value[value] || value
}

const filteredTemplates = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return mgr.templates.value.filter((t) => {
    const matchQ = !q || t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q)
    const matchCat = filterCategory.value === 'all' || t.category === filterCategory.value
    return matchQ && matchCat
  })
})

const templateCount = computed(() => mgr.templates.value.length)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.defaultEditing) {
        openFormModal()
      } else {
        formModalOpen.value = false
      }
    } else {
      formModalOpen.value = false
    }
  },
)

function onOverlayClick(event, closeFn) {
  if (event.target === event.currentTarget) closeFn()
}

function closeAll() {
  formModalOpen.value = false
  emit('close')
}

function closeFormModal() {
  formModalOpen.value = false
  if (props.defaultEditing) {
    emit('close')
  }
}

function openFormModal() {
  currentForm.value = emptyForm()
  formModalOpen.value = true
}

function useTemplate(content) {
  emit('use-template', content)
  closeAll()
}

function editTemplate(t) {
  currentForm.value = {
    id: t.id,
    title: t.title,
    content: t.content,
    category: t.category,
    active: t.active !== false,
  }
  formModalOpen.value = true
}

function newTemplate() {
  openFormModal()
}

async function saveTemplate() {
  if (!currentForm.value.title?.trim() || !currentForm.value.content?.trim()) {
    return
  }
  if (submitting.value) return
  submitting.value = true
  try {
    const ok = await mgr.saveTemplate({ ...currentForm.value })
    if (ok) {
      formModalOpen.value = false
      if (props.defaultEditing) {
        emit('close')
      }
    }
  } finally {
    submitting.value = false
  }
}

async function deleteTemplate(id) {
  await mgr.deleteTemplate(id)
}
</script>

<template>
  <Teleport to="body">
    <!-- Danh sách template (modal chính) -->
    <div
      class="cm-modal-overlay cm-feature-vars"
      :class="{ open: isOpen && !defaultEditing }"
      @click="onOverlayClick($event, closeAll)"
    >
      <div class="cm-modal size-lg" role="dialog" aria-modal="true" @click.stop>
        <div class="cm-modal-head">
          <div class="cm-modal-title">Quản lý <em>Template hỗ trợ</em></div>
          <span class="cm-modal-head-meta">{{ templateCount }} template</span>
          <button type="button" class="cm-modal-close" aria-label="Đóng" @click="closeAll">
            <AppIcon name="close" :size="14" />
          </button>
        </div>

        <div class="cm-modal-body">
          <div class="tpl-toolbar">
            <div class="tpl-search">
              <AppIcon name="search" />
              <input v-model="searchQuery" type="text" placeholder="Tìm tên, nội dung template..." />
            </div>
            <select v-model="filterCategory" class="tpl-cat-select">
              <option value="all">Tất cả danh mục</option>
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
            </select>
            <button type="button" class="tpl-add-btn" @click="newTemplate">
              <AppIcon name="plus" /> Thêm template
            </button>
          </div>

          <div class="tpl-table-wrap">
            <table class="tpl-table">
              <thead>
                <tr>
                  <th>Tên template</th>
                  <th>Danh mục</th>
                  <th>Nội dung (xem trước)</th>
                  <th>Trạng thái</th>
                  <th style="width: 110px">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in filteredTemplates" :key="t.id">
                  <td><strong>{{ t.title }}</strong></td>
                  <td><span class="badge b-navy">{{ categoryLabel(t.category) }}</span></td>
                  <td style="max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-mid)">
                    {{ t.content }}
                  </td>
                  <td>
                    <span class="cm-status-badge" :class="t.active ? 's-resolved' : 's-closed'">
                      {{ t.active ? 'Bật' : 'Tắt' }}
                    </span>
                  </td>
                  <td>
                    <div class="tpl-row-actions">
                      <button type="button" class="ra-btn ra-view" title="Dùng ngay" @click="useTemplate(t.content)">
                        <AppIcon name="send" />
                      </button>
                      <button type="button" class="ra-btn ra-edit" title="Sửa" @click="editTemplate(t)">
                        <AppIcon name="pencil" />
                      </button>
                      <button type="button" class="ra-btn ra-del" title="Xóa" @click="deleteTemplate(t.id)">
                        <AppIcon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!filteredTemplates.length">
                  <td colspan="5" style="text-align: center; padding: 16px; color: var(--text4); font-size: 12px">
                    Chưa có template phù hợp.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="cm-modal-foot">
          <button type="button" class="btn-ghost" @click="closeAll">Đóng</button>
        </div>
      </div>
    </div>

    <!-- Thêm / sửa template (modal riêng như mẫu HTML) -->
    <div
      class="cm-modal-overlay cm-modal-overlay--form cm-feature-vars"
      :class="{ open: (isOpen && defaultEditing) || formModalOpen }"
      @click="onOverlayClick($event, closeFormModal)"
    >
      <div class="cm-modal size-md" role="dialog" aria-modal="true" @click.stop>
        <div class="cm-modal-head">
          <div class="cm-modal-title">
            <template v-if="currentForm.id">Sửa <em>template</em></template>
            <template v-else>Thêm <em>template mới</em></template>
          </div>
          <button type="button" class="cm-modal-close" aria-label="Đóng" @click="closeFormModal">
            <AppIcon name="close" :size="14" />
          </button>
        </div>

        <div class="cm-modal-body">
          <div class="tpl-form-grid">
            <div class="tfg full">
              <label class="tfl">Tiêu đề *</label>
              <input v-model="currentForm.title" type="text" class="tfi" placeholder="VD: Chào hỏi khách mới" />
            </div>
            <div class="tfg">
              <label class="tfl">Phân loại</label>
              <select v-model="currentForm.category" class="tfi">
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            <div class="tfg">
              <label class="tfl">Trạng thái</label>
              <div class="tfi-toggle">
                <div class="tfi-tog-opt" :class="{ active: currentForm.active }" @click="currentForm.active = true">Bật</div>
                <div class="tfi-tog-opt" :class="{ active: !currentForm.active }" @click="currentForm.active = false">Tắt</div>
              </div>
            </div>
            <div class="tfg full">
              <label class="tfl">Nội dung template *</label>
              <textarea
                v-model="currentForm.content"
                class="tfi"
                rows="5"
                placeholder="Nội dung tin nhắn mẫu. Dùng {{tên}} để chèn tên khách..."
              ></textarea>
            </div>
          </div>
        </div>

        <div class="cm-modal-foot">
          <button type="button" class="btn-ghost" :disabled="submitting" @click="closeFormModal">Huỷ</button>
          <button type="button" class="btn-primary" :disabled="submitting" @click="saveTemplate">
            <AppIcon name="check" :size="14" />
            {{ submitting ? 'Đang lưu...' : 'Lưu template' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
