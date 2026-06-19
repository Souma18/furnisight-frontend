<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'
import AccountSectionCard from '../AccountSectionCard.vue'
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

function tagClass(tone) {
  return tone ? `tag-${tone}` : 'tag-info'
}
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
        <button
          v-for="option in statusOptions"
          :key="option.value"
          type="button"
          class="chip"
          :class="{ active: readStatus === option.value }"
          @click="readStatus = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <button type="button" class="mark-all-btn" :disabled="!unreadCount" @click="markAllRead">
        {{ unreadCount ? t('account.notifications.markAllRead') : t('account.notifications.allRead') }}
      </button>
    </div>

    <p v-if="errorMessage" class="error">
      {{ errorMessage }}
      <button type="button" class="text-btn" @click="reload">{{ t('common.retry') }}</button>
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

        <article
          v-for="item in group.items"
          :key="item.id"
          class="notification-item"
          :class="{ unread: !item.isRead, expanded: isExpanded(item.id) }"
        >
          <div class="item-icon" :class="`item-icon--${item.type}`">
            <AppIcon :name="item.icon" :size="18" />
          </div>

          <div class="item-body">
            <div class="item-top">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-time">{{ item.time }}</div>
            </div>

            <div class="item-desc">{{ item.body }}</div>

            <div class="item-footer">
              <span class="item-tag" :class="tagClass(item.tagTone)">{{ item.tagLabel }}</span>
              <button type="button" class="text-btn" @click="toggleExpanded(item)">
                {{ isExpanded(item.id) ? t('account.notifications.hideDetail') : t('account.notifications.viewDetail') }}
              </button>
            </div>

            <div v-if="isExpanded(item.id)" class="item-detail">
              <div v-for="(value, key) in item.detail" :key="key" class="detail-row">
                <span>{{ key }}</span>
                <strong>{{ value }}</strong>
              </div>

              <div v-if="item.actions?.length" class="detail-actions">
                <button
                  v-for="action in item.actions"
                  :key="action.label"
                  type="button"
                  :class="action.variant === 'primary' ? 'primary-btn' : 'secondary-btn'"
                  @click="handleAction(action)"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>
        </article>
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

.notification-item {
  display: flex;
  gap: 0.85rem;
  padding: 0.95rem 1rem;
  border: 1px solid var(--auth-border);
  border-radius: 14px;
  background: var(--account-surface);
}

.notification-item.unread {
  border-color: color-mix(in srgb, var(--auth-brand-end) 35%, var(--auth-border));
  background: color-mix(in srgb, var(--auth-brand-end) 6%, var(--account-surface));
}

.item-icon {
  width: 2.4rem;
  height: 2.4rem;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: var(--account-text-strong);
  background: color-mix(in srgb, var(--auth-brand-start) 10%, transparent);
}

.item-icon--order {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.item-icon--promo {
  background: rgba(201, 146, 42, 0.14);
  color: #9a744f;
}

.item-icon--system {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.item-icon--review {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
}

.item-body {
  flex: 1;
  min-width: 0;
}

.item-top {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.35rem;
}

.item-title {
  font-weight: 600;
  color: var(--account-text-strong);
}

.notification-item.unread .item-title {
  color: var(--auth-text-primary);
}

.item-time {
  color: var(--account-text-muted);
  font-size: 0.78rem;
  white-space: nowrap;
}

.item-desc {
  color: var(--auth-text-secondary);
  line-height: 1.6;
}

.item-footer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.65rem;
}

.item-tag {
  display: inline-flex;
  align-items: center;
  min-height: 1.7rem;
  padding: 0 0.55rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
}

.tag-pending {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.tag-promo {
  background: rgba(201, 146, 42, 0.14);
  color: #9a744f;
}

.tag-success,
.tag-done {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.tag-info {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
}

.text-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--auth-brand-start);
}

.primary-btn {
  min-height: 2.35rem;
  padding: 0 0.9rem;
  border: none;
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
  color: var(--color-white);
  font-weight: 600;
}

.secondary-btn {
  min-height: 2.35rem;
  padding: 0 0.9rem;
  border: 1px solid var(--auth-border);
  background: var(--account-surface);
  color: var(--auth-text-primary);
}

.item-detail {
  display: grid;
  gap: 0.55rem;
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--auth-border);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--auth-text-secondary);
  font-size: 0.88rem;
}

.detail-row strong {
  color: var(--account-text-strong);
  text-align: right;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.25rem;
}

@media (max-width: 900px) {
  .toolbar {
    flex-wrap: wrap;
  }

  .intro,
  .item-top,
  .detail-row {
    grid-template-columns: 1fr;
    display: grid;
  }

  .item-footer {
    flex-wrap: wrap;
  }

  .mark-all-btn {
    margin-left: 0;
  }
}
</style>
