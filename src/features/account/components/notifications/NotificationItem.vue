<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import AppButton from '@shared/ui/AppButton.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-expanded', 'action'])
const { t } = useI18n()

function tagClass(tone) {
  return tone ? `tag-${tone}` : 'tag-info'
}

function voucherDiscountLabel(metadata) {
  if (!metadata) return ''
  const { discountValue, discountType } = metadata
  const valStr = String(discountValue || '').replace(/\.0$/, '')
  if (discountType === 'PERCENTAGE' || discountType === 'PERCENT') return `-${valStr}%`
  if (discountType === 'FIXED_AMOUNT' || discountType === 'FIXED') return `-${Number(discountValue || 0).toLocaleString('vi-VN')}đ`
  if (discountType === 'FREE_SHIPPING' || discountType === 'SHIPPING_CAP') return 'Miễn phí vận chuyển'
  return valStr
}

function voucherMinOrderLabel(metadata) {
  if (!metadata?.minOrder) return null
  return `Đơn tối thiểu ${Number(metadata.minOrder).toLocaleString('vi-VN')}đ`
}

function voucherExpiry(metadata) {
  if (!metadata?.validUntil) return null
  return new Date(metadata.validUntil).toLocaleDateString('vi-VN')
}
</script>

<template>
  <article
    class="notification-item"
    :class="{ unread: !item.isRead, expanded: expanded }"
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
        <AppButton type="button" class="text-btn" @click="emit('toggle-expanded', item)">
          {{ expanded ? t('account.notifications.hideDetail') : t('account.notifications.viewDetail') }}
        </AppButton>
      </div>

      <div v-if="expanded" class="item-detail">
        <div v-for="(value, key) in item.detail" :key="key" class="detail-row">
          <span>{{ key }}</span>
          <strong>{{ value }}</strong>
        </div>

        <div v-if="item.metadata?.voucherId" class="notif-voucher-card">
          <div class="nvc-left">
            <AppIcon name="badgePercent" :size="22" />
          </div>
          <div class="nvc-info">
            <div class="nvc-discount">{{ voucherDiscountLabel(item.metadata) }}</div>
            <div class="nvc-name">{{ item.metadata.voucherCode }}</div>
            <div v-if="voucherMinOrderLabel(item.metadata)" class="nvc-meta">{{ voucherMinOrderLabel(item.metadata) }}</div>
            <div v-if="voucherExpiry(item.metadata)" class="nvc-expiry">HSD: {{ voucherExpiry(item.metadata) }}</div>
          </div>
          <div class="nvc-badge">VOUCHER</div>
        </div>

        <div v-if="item.actions?.length" class="detail-actions">
          <AppButton
            v-for="action in item.actions"
            :key="action.label"
            type="button"
            :class="action.variant === 'primary' ? 'primary-btn' : 'secondary-btn'"
            @click="emit('action', action)"
          >
            {{ action.label }}
          </AppButton>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
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
  border-radius: var(--auth-radius-md);
  cursor: pointer;
  font: inherit;
}

.primary-btn {
  min-height: 2.35rem;
  padding: 0 0.9rem;
  border: none;
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
  color: var(--color-white);
  font-weight: 600;
  border-radius: var(--auth-radius-md);
  cursor: pointer;
  font: inherit;
}

.secondary-btn {
  min-height: 2.35rem;
  padding: 0 0.9rem;
  border: 1px solid var(--auth-border);
  background: var(--account-surface);
  color: var(--auth-text-primary);
  border-radius: var(--auth-radius-md);
  cursor: pointer;
  font: inherit;
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
  .item-top,
  .detail-row {
    grid-template-columns: 1fr;
    display: grid;
  }

  .item-footer {
    flex-wrap: wrap;
  }
}

/* ---- In-notification Voucher Card ---- */
.notif-voucher-card {
  display: grid;
  grid-template-columns: 44px 1fr 40px;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #fffbf2 0%, #fff8ea 100%);
  border: 1.5px dashed #c9953a;
  border-radius: 12px;
  padding: 10px 12px;
  margin-top: 6px;
  position: relative;
  overflow: hidden;
}
.notif-voucher-card::before {
  content: '';
  position: absolute;
  left: 43px;
  top: 0; bottom: 0;
  border-left: 2px dashed #e8d4aa;
}
.nvc-left {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--auth-brand-start, #c9922a) 16%, #fff);
  color: #8a5c00;
}
.nvc-info { min-width: 0; }
.nvc-discount {
  font-size: 1rem;
  font-weight: 800;
  color: #b8630a;
}
.nvc-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--auth-brand-start, #c9922a);
  letter-spacing: .06em;
  margin-top: 1px;
}
.nvc-meta, .nvc-expiry {
  font-size: 0.72rem;
  color: var(--auth-text-secondary, #6b6560);
  margin-top: 1px;
}
.nvc-expiry { color: #be123c; font-weight: 600; }
.nvc-badge {
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: .1em;
  color: #c9953a;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  opacity: 0.4;
  user-select: none;
}
</style>
