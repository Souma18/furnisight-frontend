<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'
import AccountSectionCard from '../AccountSectionCard.vue'
import NotificationItem from '../notifications/NotificationItem.vue'
import { useNotificationsCenter } from '../../composables/useNotificationsCenter'

const props = defineProps({
  notificationCategory: {
    type: String,
    default: 'all',
  },
})

const emit = defineEmits(['notify'])
const { t } = useI18n()

const {
  loading,
  errorMessage,
  groupedNotifications,
  activeCategory,
  readStatus,
  totalCount,
  unreadCount,
  statusOptions,
  isExpanded,
  toggleExpanded,
  markAllRead,
  handleAction,
  reload,
} = useNotificationsCenter(emit, computed(() => props.notificationCategory))

const categoryLabelMap = computed(() => ({
  all: t('account.notifications.categories.all'),
  order: t('account.notifications.categories.order'),
  promo: t('account.notifications.categories.promo'),
  system: t('account.notifications.categories.system'),
  review: t('account.notifications.categories.review'),
}))

// Voucher rendering functions moved to NotificationItem.vue
</script>

<template>
  <AccountSectionCard :title="t('account.notifications.title')">
    <div class="intro">
      <p>
        {{ t('account.notifications.introPrefix') }}
        <strong>{{ categoryLabelMap[activeCategory] ?? t('account.notifications.categories.all') }}</strong>.
      </p>
      <strong>{{ t('account.notifications.total', { count: totalCount }) }}</strong>
    </div>

    <div class="toolbar">
      <div class="chips">
        <AppButton
          v-for="option in statusOptions"
          :key="option.value"
          type="button"
          class="chip"
          :class="{ active: readStatus === option.value }"
          @click="readStatus = option.value"
        >
          {{ option.label }}
        </AppButton>
      </div>

      <AppButton type="button" class="mark-all-btn" :disabled="!unreadCount" @click="markAllRead">
        {{ unreadCount ? t('account.notifications.markAllRead') : t('account.notifications.allRead') }}
      </AppButton>
    </div>

    <p v-if="errorMessage" class="error">
      {{ errorMessage }}
      <AppButton type="button" class="text-btn" @click="reload">{{ t('common.retry') }}</AppButton>
    </p>

    <div v-else-if="loading" class="state-card">{{ t('account.notifications.loading') }}</div>

    <div v-else-if="!groupedNotifications.length" class="state-card">
      <div class="empty-icon">
        <AppIcon name="bell" :size="28" />
      </div>
      <strong>{{ t('account.notifications.emptyTitle') }}</strong>
      <p>{{ t('account.notifications.emptySub') }}</p>
    </div>

    <div v-else class="groups">
      <section v-for="group in groupedNotifications" :key="group.dateLabel" class="group">
        <div class="group-label">{{ group.dateLabel }}</div>

        <NotificationItem
          v-for="item in group.items"
          :key="item.id"
          :item="item"
          :expanded="isExpanded(item.id)"
          @toggle-expanded="toggleExpanded"
          @action="handleAction"
        />
      </section>
    </div>
  </AccountSectionCard>
</template>

<style scoped>
.intro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.intro p {
  margin: 0;
  color: var(--account-text-muted);
}

.intro strong {
  color: var(--account-text-strong);
  white-space: nowrap;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem 0 1rem;
  border-bottom: 1px solid var(--auth-border);
}

.chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip,
.mark-all-btn,
.secondary-btn,
.text-btn,
.primary-btn {
  border-radius: var(--auth-radius-md);
  cursor: pointer;
  font: inherit;
}

.chip {
  min-height: auto;
  padding: 0.35rem 0.9rem;
  border: 1px solid var(--auth-border);
  background: var(--account-surface);
  color: var(--auth-text-secondary);
  font-size: 0.78rem;
  font-weight: 500;
  transition: all 0.2s;
}

.chip:hover {
  border-color: var(--auth-brand-end);
  color: var(--auth-brand-start);
}

.chip.active {
  background: var(--account-stat-default);
  border-color: var(--account-stat-default);
  color: var(--color-white);
  font-weight: 600;
}

.mark-all-btn {
  margin-left: auto;
  padding: 0;
  border: none;
  background: none;
  color: var(--auth-brand-start);
  font-size: 0.78rem;
  font-weight: 500;
  transition: color 0.2s;
}

.mark-all-btn:hover {
  color: var(--auth-brand-end);
}

.mark-all-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
  color: var(--account-toast-error);
}

.state-card {
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  padding: 2.5rem 1rem;
  border: 1px dashed var(--auth-border);
  border-radius: 14px;
  text-align: center;
  color: var(--account-text-muted);
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--auth-brand-start) 10%, transparent);
}

.groups {
  display: grid;
  gap: 1rem;
}

.group {
  display: grid;
  gap: 0.65rem;
}

.group-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--account-text-muted);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.group-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--auth-border);
}

@media (max-width: 900px) {
  .toolbar {
    flex-wrap: wrap;
  }

  .intro {
    grid-template-columns: 1fr;
    display: grid;
  }

  .mark-all-btn {
    margin-left: 0;
  }
}
</style>
