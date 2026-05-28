<script setup>
import { ADMIN_PERMISSION_OPTIONS } from '../../config/adminPermissions'

const model = defineModel({ type: Array, default: () => [] })

function toggle(id) {
  const set = new Set(model.value)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  model.value = [...set]
}

function isChecked(id) {
  return model.value.includes(id)
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
