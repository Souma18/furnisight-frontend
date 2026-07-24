<script setup>
import { useI18n } from "vue-i18n";
import AppInput from "@shared/ui/AppInput.vue";
import AppIcon from "@shared/ui/AppIcon.vue";

defineProps({
  searchKeyword: {
    type: String,
    default: "",
  },
  filteredProductsCount: {
    type: Number,
    default: 0,
  },
  showAllRooms: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["search-change", "toggle-show-all-rooms"]);

const { t } = useI18n();
</script>

<template>
  <div class="panel-top">
    <div class="panel-heading">
      <div>
        <span>{{ t("room3d.products.kicker") }}</span>
        <strong>{{ t("room3d.products.title") }}</strong>
      </div>
      <small>{{ t("room3d.products.count", { count: filteredProductsCount }) }}</small>
    </div>

    <div class="search-wrap">
      <span class="search-icon"><AppIcon name="search" :size="16" /></span>
      <AppInput
        class="search-input"
        :value="searchKeyword"
        :placeholder="t('room3d.products.search')"
        @input="$emit('search-change', $event.target.value)"
      />
    </div>

    <div class="all-rooms-toggle" style="margin-top: 12px; display: flex; align-items: center; gap: 8px;">
      <input 
        type="checkbox" 
        id="show-all-rooms" 
        :checked="showAllRooms"
        @change="$emit('toggle-show-all-rooms')"
        style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--color-primary, #667eea);"
      />
      <label for="show-all-rooms" style="cursor: pointer; font-size: 13px; color: var(--text-color, #4a5568); user-select: none;">
        Hiển thị đồ nội thất từ các phòng khác
      </label>
    </div>

    <div v-if="filteredProductsCount > 0" class="ai-strip">
      <p class="ai-label">
        {{ t("room3d.products.aiLabel") }}
        <span class="smart">{{ t("room3d.products.aiSmart") }}</span>
      </p>
      <p class="ai-text">
        {{ t("room3d.products.aiText") }}
      </p>
    </div>
  </div>
</template>
