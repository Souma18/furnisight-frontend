<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import { computed, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  manager: {
    type: Object,
    required: true,
  },
  isOpen: Boolean,
})

const emit = defineEmits(['close', 'use-template', 'edit-template', 'add-template'])
const mgr = props.manager

const searchQuery = ref('')
const filterCategory = ref('all')

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

function onOverlayClick(event) {
  if (event.target === event.currentTarget) close()
}

function close() {
  emit('close')
}

async function deleteTemplate(id) {
  await mgr.deleteTemplate(id)
}
</script>

<template>
  <div
    class="cm-modal-overlay cm-feature-vars"
    :class="{ open: isOpen }"
    @click="onOverlayClick"
  >
    <div class="cm-modal size-lg" role="dialog" aria-modal="true" @click.stop>
      <div class="cm-modal-head">
        <div class="cm-modal-title">Quản lý <em>Template hỗ trợ</em></div>
        <span class="cm-modal-head-meta">{{ templateCount }} template</span>
        <AppButton variant="unstyled" type="button" class="cm-modal-close" aria-label="Đóng" @click="close">
          <AppIcon name="close" :size="14" />
        </AppButton>
      </div>

      <div class="cm-modal-body">
        <div class="tpl-toolbar">
          <div class="tpl-search">
            <AppIcon name="search" />
            <AppInput v-model="searchQuery" type="text" placeholder="Tìm tên, nội dung template..." />
          </div>
          <select v-model="filterCategory" class="tpl-cat-select">
            <option value="all">Tất cả danh mục</option>
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
          </select>
          <AppButton variant="unstyled" type="button" class="tpl-add-btn" @click="emit('add-template')">
            <AppIcon name="plus" /> Thêm template
          </AppButton>
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
                    <AppButton variant="unstyled" type="button" class="ra-btn ra-view" title="Dùng ngay" @click="emit('use-template', t.content)">
                      <AppIcon name="send" />
                    </AppButton>
                    <AppButton variant="unstyled" type="button" class="ra-btn ra-edit" title="Sửa" @click="emit('edit-template', t)">
                      <AppIcon name="pencil" />
                    </AppButton>
                    <AppButton variant="unstyled" type="button" class="ra-btn ra-del" title="Xóa" @click="deleteTemplate(t.id)">
                      <AppIcon name="trash" />
                    </AppButton>
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
        <AppButton variant="unstyled" type="button" class="btn-ghost" @click="close">Đóng</AppButton>
      </div>
    </div>
  </div>
</template>
