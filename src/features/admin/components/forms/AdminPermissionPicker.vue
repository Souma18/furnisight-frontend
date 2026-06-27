<script setup>
import { ADMIN_PERMISSION_OPTIONS } from '../../config/adminPermissions'

const model = defineModel({ type: Array, default: () => [] })

function normalizePermission(value) {
  return String(value ?? '').trim().replace(/-/g, '_').toUpperCase()
}

function toggle(id) {
  const normalizedId = normalizePermission(id)
  const set = new Set((model.value || []).map(normalizePermission).filter(Boolean))
  if (set.has(normalizedId)) set.delete(normalizedId)
  else set.add(normalizedId)
  model.value = [...set]
}

function isChecked(id) {
  const normalizedId = normalizePermission(id)
  return (model.value || []).some((value) => normalizePermission(value) === normalizedId)
}
</script>

<template>
  <div class="mform-group">
    <label class="mfl">Quyền hạn</label>
    <div class="perm-check-grid">
      <label
        v-for="opt in ADMIN_PERMISSION_OPTIONS"
        :key="opt.id"
        class="perm-check-item"
      >
        <input type="checkbox" :checked="isChecked(opt.id)" @change="toggle(opt.id)" />
        {{ opt.label }}
      </label>
    </div>
  </div>
</template>
