<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  pagination: { type: Object, default: null },
  tableClass: { type: String, default: '' },
})

const emit = defineEmits(['page'])
</script>

<template>
  <div class="full-table-wrap">
    <table class="full-table" :class="tableClass">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :class="col.thClass">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id ?? row.key">
          <td v-for="col in columns" :key="col.key" :class="col.tdClass">
            <slot :name="`cell-${col.key}`" :row="row">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="pagination" class="pagination">
      <div class="pg-info" v-html="pagination.info" />
      <div class="pg-btns">
        <AppButton
          v-for="btn in pagination.buttons"
          :key="String(btn.label) + String(btn.page)"
          type="button"
          class="pg-btn"
          :class="{ active: btn.active }"
          @click="btn.page && emit('page', btn.page)"
        >
          <AppIcon v-if="btn.icon" :name="btn.icon" :size="14" />
          <template v-else>{{ btn.label }}</template>
        </AppButton>
      </div>
    </div>
  </div>
</template>
