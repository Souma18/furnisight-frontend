<script setup>
import { computed, reactive, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import ConfirmDialog from '@shared/ui/ConfirmDialog.vue'
import { ADMIN_PROMOTION_TABS } from '../../config/adminPromotionContent'
import {
  createAdminPromotionEditingState,
  createAdminPromotionFilters,
  createAdminPromotionModalState,
  PROMOTION_SEGMENTS,
} from '../../config/adminPromotionState'
import {
  channelText,
  dateOnly,
  discountLabel,
  isImageUrl,
  money,
  numberText,
  segmentLabel,
  statusLabel,
  statusTone,
  targetText,
  voucherStatusTone,
} from '../../lib/adminPromotionFormatters'
import { useAdminCampaigns } from '../../composables/useAdminCampaigns'
import { useAdminCombos } from '../../composables/useAdminCombos'
import { useAdminNotifications } from '../../composables/useAdminNotifications'
import { useAdminTemplates } from '../../composables/useAdminTemplates'
import { useAdminPromotionShell } from '../../composables/useAdminPromotionShell'
import { useAdminPromotionToast } from '../../composables/useAdminPromotionToast'
import { useAdminPromotionUsers } from '../../composables/useAdminPromotionUsers'
import { useAdminVouchers } from '../../composables/useAdminVouchers'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminVoucherForm from '../../components/promotion/AdminVoucherForm.vue'

const tabs = ADMIN_PROMOTION_TABS
const loading = ref(false)
const saving = ref(false)
const { toast, notify } = useAdminPromotionToast()
const { users, loadUsersForTarget } = useAdminPromotionUsers({ notify })

const filters = reactive(createAdminPromotionFilters())
const modal = reactive(createAdminPromotionModalState())
const editing = reactive(createAdminPromotionEditingState())

const {
  stats,
  vouchers,
  publish,
  voucherForm,
  publishing,
  filteredUsers,
  loadVoucherData,
  openVoucherModal,
  saveVoucher,
  deleteVoucher,
  openPublishDrawer,
  confirmPublishVoucher,
} = useAdminVouchers({
  filters,
  modal,
  editing,
  users,
  loading,
  saving,
  notify,
})

const {
  campaigns,
  campaignForm,
  campaignUserQuery,
  filteredCampaigns,
  filteredCampaignUsers,
  loadCampaigns,
  openCampaignModal,
  saveCampaign,
  deleteCampaign,
} = useAdminCampaigns({
  filters,
  modal,
  editing,
  users,
  vouchers,
  notify,
})

const {
  combos,
  comboForm,
  picker,
  comboDeleteTarget,
  deletingCombo,
  filteredCombos,
  filteredProducts,
  productCategories,
  selectedPickerProducts,
  comboOriginalAmount,
  comboFinalAmount,
  comboSavedAmount,
  loadCombos,
  loadProductsForPicker,
  openComboModal,
  onComboImageChange,
  removeComboImage,
  closeComboModal,
  saveCombo,
  openProductPicker,
  togglePickerProduct,
  applyPickerProducts,
  removeComboItem,
  requestComboDelete,
  closeComboDelete,
  confirmComboDelete,
} = useAdminCombos({
  filters,
  modal,
  editing,
  saving,
  notify,
})

const {
  notifications,
  notifyForm,
  notifyUserQuery,
  filteredNotifications,
  filteredNotificationUsers,
  loadNotifications,
  openNotifyModal,
  saveNotification,
  deleteNotification,
} = useAdminNotifications({
  filters,
  modal,
  editing,
  users,
  notify,
})

const {
  templates,
  promotionTemplates,
  templateForm,
  filteredTemplates,
  loadTemplates,
  openTemplateModal,
  openPreviewModal,
  openUnlayerEditor,
  saveUnlayerDesign,
  saveTemplate,
  deleteTemplate,
} = useAdminTemplates({
  filters,
  modal,
  editing,
  notify,
})

function applyTemplateToForm(templateId, formTarget) {
  if (!templateId) return
  const t = templates.value.find(x => x.id === templateId)
  if (t) {
    let title = t.titleTemplate || ''
    let body = t.bodyTemplate || ''
    
    // Replace variables if a voucher is selected
    let selectedVoucher = null
    if (formTarget === 'campaign' && campaignForm.voucherId) {
      selectedVoucher = vouchers.value.find(v => v.id === campaignForm.voucherId)
    } else if (formTarget === 'notify' && notifyForm.relatedVoucherId) {
      selectedVoucher = vouchers.value.find(v => v.id === notifyForm.relatedVoucherId)
    } else if (formTarget === 'publish' && publish.value?.voucher) {
      selectedVoucher = publish.value.voucher
    }
    
    if (selectedVoucher) {
      title = title.replace(/\{\{voucherName\}\}/g, selectedVoucher.name || '')
      title = title.replace(/\{\{voucherDescription\}\}/g, selectedVoucher.description || '')
      
      const vName = selectedVoucher.name || ''
      const vDesc = selectedVoucher.description || ''
      
      const match = body.match(/<!--\s*UNLAYER_DESIGN_START\s*([\s\S]*?)\s*UNLAYER_DESIGN_END\s*-->/)
      if (match && match[1]) {
        try {
          let htmlPart = body.replace(match[0], '')
          htmlPart = htmlPart.replace(/\{\{voucherName\}\}/g, vName).replace(/\{\{voucherDescription\}\}/g, vDesc)
          
          let designObj = JSON.parse(match[1])
          const replaceInObj = (obj) => {
            for (const key in obj) {
              if (typeof obj[key] === 'string') {
                obj[key] = obj[key].replace(/\{\{voucherName\}\}/g, vName).replace(/\{\{voucherDescription\}\}/g, vDesc)
              } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                replaceInObj(obj[key])
              }
            }
          }
          replaceInObj(designObj)
          body = `<!-- UNLAYER_DESIGN_START ${JSON.stringify(designObj)} UNLAYER_DESIGN_END -->\n${htmlPart}`
        } catch (e) {
          console.error('Failed to replace vars in JSON', e)
          body = body.replace(/\{\{voucherName\}\}/g, vName).replace(/\{\{voucherDescription\}\}/g, vDesc)
        }
      } else {
        body = body.replace(/\{\{voucherName\}\}/g, vName).replace(/\{\{voucherDescription\}\}/g, vDesc)
      }
    }

    if (formTarget === 'campaign') {
      campaignForm.notificationTitle = title
      campaignForm.notificationBody = body
    } else if (formTarget === 'notify') {
      notifyForm.title = title
      notifyForm.body = body
    } else if (formTarget === 'publish') {
      publish.value.title = title
      publish.value.body = body
    }
  }
}

const showCampaignUserPicker = ref(false)
const showNotifyUserPicker = ref(false)
const showPublishUserPicker = ref(false)

const isHtmlContent = (str) => typeof str === 'string' && (str.includes('<!DOCTYPE html>') || str.includes('<html') || str.includes('UNLAYER_DESIGN_START'))

// --- Voucher Preview ---
const selectedPublishVoucher = computed(() =>
  publish.value?.voucher ? publish.value.voucher : null
)
const selectedNotifyVoucher = computed(() =>
  notifyForm.relatedVoucherId ? vouchers.value.find(v => v.id === notifyForm.relatedVoucherId) : null
)
const selectedCampaignVoucher = computed(() =>
  campaignForm.voucherId ? vouchers.value.find(v => v.id === campaignForm.voucherId) : null
)

function discountPreviewLabel(voucher) {
  if (!voucher) return ''
  const valStr = String(voucher.discountValue || '').replace(/\.0$/, '')
  if (voucher.discountType === 'PERCENTAGE' || voucher.discountType === 'PERCENT') return `-${valStr}%`
  if (voucher.discountType === 'FIXED_AMOUNT' || voucher.discountType === 'FIXED') return `-${Number(voucher.discountValue || 0).toLocaleString('vi-VN')}đ`
  if (voucher.discountType === 'FREE_SHIPPING' || voucher.discountType === 'SHIPPING_CAP') return 'Miễn phí vận chuyển'
  return valStr
}
function minOrderLabel(voucher) {
  if (!voucher || !voucher.minOrder) return 'Không yêu cầu'
  return `Đơn tối thiểu ${Number(voucher.minOrder).toLocaleString('vi-VN')}đ`
}
function expireDateLabel(voucher) {
  if (!voucher?.endDate) return ''
  return new Date(voucher.endDate).toLocaleDateString('vi-VN')
}

function openPreviewHtml(title, body) {
  editing.previewTemplate = { name: 'Xem trước nội dung', titleTemplate: title, bodyTemplate: body }
  modal.previewTemplate = true
}

const getPreviewHtml = (body) => {
  if (isHtmlContent(body)) return body
  return `<div style="font-family: Arial, sans-serif; padding: 20px; white-space: pre-wrap; color: #333; font-size: 14px; line-height: 1.5;">${body || ''}</div>`
}

const {
  activeTab,
  activeAction,
  kpis,
  openPrimaryAction,
} = useAdminPromotionShell({
  tabs,
  stats,
  campaigns,
  combos,
  loadVoucherData,
  loadCampaigns,
  loadCombos,
  loadNotifications,
  loadProductsForPicker,
  loadUsersForTarget,
  openVoucherModal,
  openCampaignModal,
  openComboModal,
  openNotifyModal,
  loadTemplates,
  openTemplateModal,
})
</script>

<template>
  <div class="marketing-center">
    <AdminPageHeader
      eyebrow="Quản lý hệ thống"
      title-html="Marketing <em>Center</em>"
      subtitle="Quản lý voucher, chiến dịch, combo khuyến mãi và thông báo"
    >
      <template #actions>
        <button type="button" class="mc-primary" @click="openPrimaryAction">
          <AppIcon name="plus" :size="15" />{{ activeAction }}
        </button>
      </template>
    </AdminPageHeader>

    <div class="mc-stats">
      <article v-for="item in kpis" :key="item.label" class="mc-stat">
        <div class="stat-icon"><AppIcon :name="item.icon" :size="17" /></div>
        <span>{{ item.label }}</span>
        <strong :class="{ gold: item.gold }">{{ numberText(item.value) }}</strong>
        <small>{{ item.sub }}</small>
      </article>
    </div>

    <nav class="mc-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <section v-if="activeTab === 'voucher'" class="mc-card">
      <div class="mc-filter">
        <input v-model="filters.voucher.query" class="mc-input" placeholder="Tìm theo mã hoặc tên..." @keyup.enter="loadVoucherData">
        <select v-model="filters.voucher.type" class="mc-select" @change="loadVoucherData">
          <option value="">Tất cả loại</option>
          <option value="PUBLIC">PUBLIC</option>
          <option value="PERSONAL">PERSONAL</option>
          <option value="MARKETING">MARKETING</option>
        </select>
        <select v-model="filters.voucher.status" class="mc-select" @change="loadVoucherData">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang bật</option>
          <option value="inactive">Đang tắt</option>
          <option value="expired">Hết hạn</option>
        </select>
        <button type="button" class="mc-outline" @click="loadVoucherData"><AppIcon name="search" :size="14" />Lọc</button>
      </div>
      <div class="mc-table-wrap">
        <table class="mc-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên</th>
              <th>Loại</th>
              <th>Giảm</th>
              <th>Đã phát</th>
              <th>Đơn tối thiểu</th>
              <th>Hết hạn</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="9" class="mc-empty">Đang tải voucher...</td></tr>
            <tr v-else-if="!vouchers.length"><td colspan="9" class="mc-empty">Chưa có voucher phù hợp.</td></tr>
            <tr v-for="row in vouchers" v-else :key="row.id">
              <td><span class="code-badge">{{ row.code }}</span></td>
              <td class="mc-name"><div class="combo-name-cell"><img v-if="row.imageUrl" :src="row.imageUrl" alt=""><span>{{ row.name }}</span></div></td>
              <td><span class="type-badge" :class="`type-${String(row.voucherType || 'PUBLIC').toLowerCase()}`">{{ row.voucherType || 'PUBLIC' }}</span></td>
              <td><span class="discount-gold">{{ discountLabel(row) }}</span></td>
              <td><span class="sent-count">{{ row.issuedCount || 0 }} user</span></td>
              <td>{{ money(row.minOrder) }}</td>
              <td>{{ dateOnly(row.endDate) }}</td>
              <td><span class="status-badge" :class="voucherStatusTone(row)"><span />{{ row.statusLabel || (row.active ? 'Đang bật' : 'Đang tắt') }}</span></td>
              <td>
                <div class="mc-actions">
                  <button type="button" title="Xem/Sửa" @click="openVoucherModal(row)"><AppIcon name="eye" :size="14" /></button>
                  <button type="button" title="Sửa" @click="openVoucherModal(row)"><AppIcon name="edit" :size="14" /></button>
                  <button type="button" class="publish" title="Phát hành" @click="openPublishDrawer(row)"><AppIcon name="send" :size="14" /></button>
                  <button type="button" class="danger" title="Xóa" @click="deleteVoucher(row)"><AppIcon name="trash" :size="14" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination"><span>Hiển thị {{ vouchers.length }} voucher</span><div><button>1</button><button disabled>2</button></div></div>
    </section>

    <section v-if="activeTab === 'campaign'" class="mc-card">
      <div class="mc-filter">
        <input v-model="filters.campaign.query" class="mc-input" placeholder="Tìm chiến dịch..." @keyup.enter="loadCampaigns">
        <select v-model="filters.campaign.status" class="mc-select">
          <option value="">Tất cả trạng thái</option>
          <option value="RUNNING">Đang chạy</option>
          <option value="SCHEDULED">Đã hẹn lịch</option>
          <option value="DRAFT">Bản nháp</option>
        </select>
        <button type="button" class="mc-outline" @click="loadCampaigns"><AppIcon name="search" :size="14" />Lọc</button>
      </div>
      <div class="mc-table-wrap">
        <table class="mc-table">
          <thead><tr><th>Chiến dịch</th><th>Voucher</th><th>Tệp nhận</th><th>Kênh</th><th>Đã gửi</th><th>Lịch</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
          <tbody>
            <tr v-if="!filteredCampaigns.length"><td colspan="8" class="mc-empty">Chưa có chiến dịch phù hợp.</td></tr>
            <tr v-for="row in filteredCampaigns" :key="row.id">
              <td class="mc-name">{{ row.name }}</td>
              <td><span class="code-badge">{{ row.voucherCode }}</span></td>
              <td>{{ row.targetLabel }}</td>
              <td>{{ channelText(row.channelLabels || row.channels) }}</td>
              <td>{{ numberText(row.sentCount) }}</td>
              <td>{{ dateOnly(row.scheduledAt) }}</td>
              <td><span class="status-badge" :class="statusTone(row.status)"><span />{{ statusLabel(row.status) }}</span></td>
              <td><div class="mc-actions"><button @click="openCampaignModal(row)" :title="row.status === 'SENT' ? 'Xem chi tiết' : 'Sửa'"><AppIcon :name="row.status === 'SENT' ? 'eye' : 'edit'" :size="14" /></button><button class="danger" @click="deleteCampaign(row)" :disabled="row.status === 'SENT'"><AppIcon name="trash" :size="14" /></button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="activeTab === 'combo'" class="mc-card">
      <div class="mc-filter">
        <input v-model="filters.combo.query" class="mc-input" placeholder="Tìm combo..." @keyup.enter="loadCombos">
        <select v-model="filters.combo.status" class="mc-select">
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang bật</option>
          <option value="DRAFT">Bản nháp</option>
        </select>
        <button type="button" class="mc-outline" @click="loadCombos"><AppIcon name="search" :size="14" />Lọc</button>
      </div>
      <div class="mc-table-wrap">
        <table class="mc-table">
          <thead><tr><th>Combo</th><th>Số SP</th><th>Giá gốc</th><th>Giá combo</th><th>Tiết kiệm</th><th>Đã dùng</th><th>Hết hạn</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
          <tbody>
            <tr v-if="!filteredCombos.length"><td colspan="9" class="mc-empty">Chưa có combo phù hợp.</td></tr>
            <tr v-for="row in filteredCombos" :key="row.id">
              <td class="mc-name">{{ row.name }}</td>
              <td>{{ row.itemCount }}</td>
              <td>{{ money(row.originalAmount) }}</td>
              <td><span class="discount-gold">{{ money(row.finalAmount) }}</span></td>
              <td>{{ money(row.savedAmount) }}</td>
              <td>{{ numberText(row.usedCount) }}</td>
              <td>{{ dateOnly(row.endDate) }}</td>
              <td><span class="status-badge" :class="statusTone(row.status)"><span />{{ statusLabel(row.status) }}</span></td>
              <td><div class="mc-actions"><button @click="openComboModal(row)"><AppIcon name="edit" :size="14" /></button><button class="danger" @click="requestComboDelete(row)"><AppIcon name="trash" :size="14" /></button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="activeTab === 'notify'" class="mc-card">
      <div class="mc-filter">
        <input v-model="filters.notify.query" class="mc-input" placeholder="Tìm thông báo..." @keyup.enter="loadNotifications">
        <select v-model="filters.notify.status" class="mc-select">
          <option value="">Tất cả trạng thái</option>
          <option value="SENT">Đã gửi</option>
          <option value="SCHEDULED">Đã hẹn lịch</option>
          <option value="DRAFT">Bản nháp</option>
        </select>
        <button type="button" class="mc-outline" @click="loadNotifications"><AppIcon name="search" :size="14" />Lọc</button>
      </div>
      <div class="mc-table-wrap">
        <table class="mc-table">
          <thead><tr><th>Tiêu đề</th><th>Tệp nhận</th><th>Kênh</th><th>Đã gửi</th><th>Lịch gửi</th><th>Tạo lúc</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
          <tbody>
            <tr v-if="!filteredNotifications.length"><td colspan="8" class="mc-empty">Chưa có thông báo phù hợp.</td></tr>
            <tr v-for="row in filteredNotifications" :key="row.id">
              <td class="mc-name">{{ row.title }}</td>
              <td>{{ row.targetLabel }}</td>
              <td>{{ channelText(row.channelLabels || row.channels) }}</td>
              <td>{{ numberText(row.sentCount) }}</td>
              <td>{{ dateOnly(row.scheduledAt) }}</td>
              <td>{{ dateOnly(row.createdAt) }}</td>
              <td><span class="status-badge" :class="statusTone(row.status)"><span />{{ statusLabel(row.status) }}</span></td>
              <td><div class="mc-actions"><button @click="openNotifyModal(row)" :title="row.status === 'SENT' ? 'Xem chi tiết' : 'Sửa'"><AppIcon :name="row.status === 'SENT' ? 'eye' : 'edit'" :size="14" /></button><button class="danger" @click="deleteNotification(row)" :disabled="row.status === 'SENT'"><AppIcon name="trash" :size="14" /></button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="activeTab === 'template'" class="mc-card">
      <div class="mc-filter">
        <input v-model="filters.template.query" class="mc-input" placeholder="Tìm tên hoặc mã mẫu thông báo..." @keyup.enter="loadTemplates">
        <select v-model="filters.template.type" class="mc-select" @change="loadTemplates">
          <option value="">Tất cả loại</option>
          <option value="PROMOTION">Khuyến mãi (Promotion)</option>
          <option value="SYSTEM">Hệ thống (System)</option>
          <option value="REVIEW">Đánh giá (Review)</option>
          <option value="ORDER">Đơn hàng (Order)</option>
        </select>
        <button type="button" class="mc-outline" @click="loadTemplates"><AppIcon name="search" :size="14" />Lọc</button>
      </div>
      <div class="mc-table-wrap">
        <table class="mc-table">
          <thead><tr><th>Mã mẫu</th><th>Tên mẫu</th><th>Loại</th><th>Tiêu đề (Template)</th><th>Hành động</th></tr></thead>
          <tbody>
            <tr v-if="!filteredTemplates.length"><td colspan="5" class="mc-empty">Chưa có mẫu thông báo nào.</td></tr>
            <tr v-for="row in filteredTemplates" :key="row.id">
              <td><span class="code-badge">{{ row.code }}</span></td>
              <td class="mc-name">{{ row.name }}</td>
              <td>{{ row.type || 'N/A' }}</td>
              <td>{{ row.titleTemplate }}</td>
              <td>
                <div class="mc-actions">
                  <button title="Xem trước" @click="openPreviewModal(row)"><AppIcon name="eye" :size="14" /></button>
                  <button title="Chỉnh sửa" @click="openTemplateModal(row)"><AppIcon name="edit" :size="14" /></button>
                  <button title="Xóa" class="danger" @click="deleteTemplate(row)"><AppIcon name="trash" :size="14" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <AdminVoucherForm
      :show="modal.voucher"
      :is-editing="editing.voucher"
      :form="voucherForm"
      :saving="saving"
      @close="modal.voucher = false"
      @submit="saveVoucher"
    />

    <form v-if="modal.campaign" class="modal-backdrop" @click.self="modal.campaign = false" @submit.prevent="saveCampaign">
      <div class="modal-card modal-lg">
        <header><h2>{{ editing.campaign ? 'Sửa' : 'Tạo' }} <em>chiến dịch</em></h2><button type="button" @click="modal.campaign = false"><AppIcon name="x" /></button></header>
        <div class="modal-body">
          <div class="section-title"><AppIcon name="calendar" />Thông tin chiến dịch</div>
          <div class="form-row"><label>Tên chiến dịch *<input v-model="campaignForm.name" required placeholder="Phát voucher cho khách mới"></label><label>Voucher<select v-model="campaignForm.voucherId"><option value="">Chọn voucher</option><option v-for="voucher in vouchers" :key="voucher.id" :value="voucher.id">{{ voucher.code }} - {{ voucher.name }}</option></select></label></div>
          <div class="section-title"><AppIcon name="users" />Tệp người nhận</div>
          <div class="choice-grid">
            <button type="button" :class="{ selected: campaignForm.targetType === 'MANUAL' }" @click="campaignForm.targetType = 'MANUAL'">Chọn thủ công<small>{{ campaignForm.targetUserIds.length }} user</small></button>
            <button type="button" :class="{ selected: campaignForm.targetType === 'ALL' }" @click="campaignForm.targetType = 'ALL'">Toàn bộ<small>1.243 user</small></button>
            <button type="button" :class="{ selected: campaignForm.targetType === 'SEGMENT' }" @click="campaignForm.targetType = 'SEGMENT'">Theo điều kiện<small>Khách mới, bỏ giỏ, không hoạt động</small></button>
          </div>
          <template v-if="campaignForm.targetType === 'MANUAL'">
            <button type="button" class="mc-outline" style="margin-bottom: 15px;" @click="showCampaignUserPicker = !showCampaignUserPicker">
              <AppIcon :name="showCampaignUserPicker ? 'chevronUp' : 'chevronDown'" :size="16" />
              {{ showCampaignUserPicker ? 'Ẩn danh sách tìm kiếm' : 'Hiển thị tìm người dùng' }}
            </button>
            <div v-show="showCampaignUserPicker" class="user-picker-wrapper">
              <label>Tìm người dùng<input v-model="campaignUserQuery" placeholder="Tên hoặc email..."></label>
              <div class="user-pick-list">
                <label v-for="user in filteredCampaignUsers" :key="user.id" class="user-pick-item"><input v-model="campaignForm.targetUserIds" type="checkbox" :value="user.id"><span>{{ user.avatar }}</span><b>{{ user.name }}</b><small>{{ user.email }}</small></label>
                <div v-if="!filteredCampaignUsers.length" class="user-pick-empty">Không tìm thấy người dùng phù hợp.</div>
              </div>
            </div>
          </template>
          <label v-if="campaignForm.targetType === 'SEGMENT'">Nhóm người dùng<select v-model="campaignForm.segmentKey"><option v-for="segment in PROMOTION_SEGMENTS" :key="segment.value" :value="segment.value">{{ segment.label }}</option></select></label>
          <div class="section-title"><AppIcon name="send" />Kênh gửi và lịch</div>
          <div class="checkbox-grid"><label class="check-line"><input v-model="campaignForm.channels" type="checkbox" value="NOTIFICATION">Notification</label><label class="check-line"><input v-model="campaignForm.channels" type="checkbox" value="EMAIL">Email</label></div>
          <div class="choice-grid"><button type="button" :class="{ selected: campaignForm.scheduleType === 'NOW' }" @click="campaignForm.scheduleType = 'NOW'">Gửi ngay</button><button type="button" :class="{ selected: campaignForm.scheduleType === 'SCHEDULED' }" @click="campaignForm.scheduleType = 'SCHEDULED'">Hẹn lịch</button></div>
          <label v-if="campaignForm.scheduleType === 'SCHEDULED'">Thời gian gửi<input v-model="campaignForm.scheduledAt" type="datetime-local"></label>
          <label>Áp dụng Mẫu thông báo (Tùy chọn)
            <select @change="applyTemplateToForm($event.target.value, 'campaign')">
              <option value="">-- Chọn mẫu thông báo --</option>
              <option v-for="t in promotionTemplates" :key="t.id" :value="t.id">{{ t.code }} - {{ t.name }}</option>
            </select>
          </label>
          <div class="form-row"><label>Tiêu đề thông báo<input v-model="campaignForm.notificationTitle" placeholder="Bạn vừa nhận voucher mới" class="large-input"></label><label>Trạng thái<select v-model="campaignForm.active"><option :value="true">Đang bật</option><option :value="false">Bản nháp</option></select></label></div>
          <label>Nội dung
            <div v-if="isHtmlContent(campaignForm.notificationBody)" class="html-content-badge">
              <AppIcon name="layout" :size="16" /> Đã áp dụng mẫu HTML
              <div class="html-actions">
                <button type="button" class="mc-outline" @click="openPreviewHtml(campaignForm.notificationTitle, campaignForm.notificationBody)">Xem trước</button>
                <button type="button" class="mc-outline" @click="openUnlayerEditor(campaignForm.notificationBody, (val) => campaignForm.notificationBody = val)">Sửa thiết kế</button>
                <button type="button" class="mc-cancel" @click="campaignForm.notificationBody = ''">Xóa / Soạn lại</button>
              </div>
            </div>
            <textarea v-else v-model="campaignForm.notificationBody" rows="12" class="large-textarea" />
          </label>

          <!-- VOUCHER PREVIEW CARD -->
          <div v-if="selectedCampaignVoucher" class="voucher-preview-wrap">
            <div class="vp-label"><AppIcon name="eye" :size="14" /> Xem trước thẻ Voucher (hiển thị với người nhận)</div>
            <div class="vp-card">
              <div class="vp-left"><AppIcon name="badgePercent" :size="26" /></div>
              <div class="vp-info">
                <div class="vp-name">{{ selectedCampaignVoucher.name }}</div>
                <div class="vp-code">{{ selectedCampaignVoucher.code }}</div>
                <div class="vp-discount">{{ discountPreviewLabel(selectedCampaignVoucher) }}</div>
                <div class="vp-meta">{{ minOrderLabel(selectedCampaignVoucher) }}</div>
                <div v-if="selectedCampaignVoucher.endDate" class="vp-expiry">HSD: {{ expireDateLabel(selectedCampaignVoucher) }}</div>
              </div>
              <div class="vp-badge">VOUCHER</div>
            </div>
          </div>

        </div>
        <footer><button type="button" class="mc-cancel" @click="modal.campaign = false">{{ editing.campaign?.status === 'SENT' ? 'Đóng' : 'Hủy' }}</button><button v-if="editing.campaign?.status !== 'SENT'" class="mc-primary"><AppIcon name="save" />Lưu chiến dịch</button></footer>
      </div>
    </form>

    <form v-if="modal.combo" class="modal-backdrop" @click.self="closeComboModal" @submit.prevent="saveCombo">
      <div class="modal-card modal-lg">
        <header><h2>{{ editing.combo ? 'Sửa' : 'Tạo' }} <em>combo</em></h2><button type="button" @click="closeComboModal"><AppIcon name="x" /></button></header>
        <div class="modal-body">
          <div class="section-title"><AppIcon name="gift" />Thông tin combo</div>
          <div class="form-row"><label>Tên combo *<input v-model="comboForm.name" required placeholder="Combo phòng ngủ FurniSight"></label><label>Loại ưu đãi<select v-model="comboForm.discountType"><option value="PERCENTAGE">Giảm theo %</option><option value="FIXED_AMOUNT">Giảm số tiền</option><option value="FIXED_COMBO_PRICE">Giá combo cố định</option></select></label></div>
          <div class="form-row"><label>Giá trị ưu đãi<input v-model.number="comboForm.discountValue" type="number" min="0"></label><label>Trạng thái<select v-model="comboForm.active"><option :value="true">Đang bật</option><option :value="false">Bản nháp</option></select></label></div>
          <div class="form-row"><label>Bắt đầu<input v-model="comboForm.startDate" type="datetime-local"></label><label>Kết thúc<input v-model="comboForm.endDate" type="datetime-local"></label></div>
          <label>Mô tả<textarea v-model="comboForm.description" rows="2" /></label>
          <label>Ảnh combo
            <span class="combo-image-upload">
              <input type="file" accept="image/*" @change="onComboImageChange">
              <span><AppIcon name="image" :size="24" />{{ saving ? 'Đang tải ảnh...' : 'Chọn ảnh đại diện combo' }}</span>
            </span>
          </label>
          <div v-if="comboForm.imageUrl" class="combo-image-preview">
            <img :src="comboForm.imageUrl" alt="Ảnh combo">
            <button type="button" title="Xóa ảnh" @click="removeComboImage"><AppIcon name="x" :size="14" /></button>
          </div>
          <div class="section-title"><AppIcon name="box" />Sản phẩm trong combo</div>
          <button type="button" class="add-product" @click="openProductPicker"><AppIcon name="plus" />Chọn sản phẩm</button>
          <div v-if="!comboForm.items.length" class="empty-box">Chưa có sản phẩm nào trong combo.</div>
          <div v-for="item in comboForm.items" :key="item.id" class="combo-item-card">
            <div class="prod-thumb"><img v-if="isImageUrl(item.image)" :src="item.image" alt=""><AppIcon v-else :name="item.image || 'box'" /></div>
            <div><b>{{ item.name }}</b><small>SKU: {{ item.sku }} · {{ money(item.price) }} · {{ item.category }}</small></div>
            <label><span>SL</span><input v-model.number="item.quantity" type="number" min="1"></label>
            <button type="button" @click="removeComboItem(item.id)"><AppIcon name="trash" /></button>
          </div>
          <div class="combo-summary"><div><span>Giá gốc</span><b>{{ money(comboOriginalAmount) }}</b></div><div><span>Giá combo</span><b>{{ money(comboFinalAmount) }}</b></div><div class="save"><span>Khách tiết kiệm</span><b>{{ money(comboSavedAmount) }}</b></div></div>
        </div>
        <footer><button type="button" class="mc-cancel" @click="closeComboModal">Hủy</button><button class="mc-primary" :disabled="saving"><AppIcon name="save" />Lưu combo</button></footer>
      </div>
    </form>

    <div v-if="modal.picker" class="modal-backdrop picker-layer" @click.self="modal.picker = false">
      <div class="modal-card modal-lg">
        <header><h2>Chọn <em>sản phẩm</em></h2><button type="button" @click="modal.picker = false"><AppIcon name="x" /></button></header>
        <div class="modal-body">
          <div class="mc-filter compact"><input v-model="picker.query" class="mc-input" placeholder="Tìm sản phẩm hoặc SKU..."><select v-model="picker.category" class="mc-select"><option value="">Tất cả danh mục</option><option v-for="category in productCategories" :key="category" :value="category">{{ category }}</option></select><select v-model="picker.stock" class="mc-select"><option value="">Tất cả tồn kho</option><option value="instock">Còn hàng</option><option value="outstock">Hết hàng</option></select></div>
          <div class="picker-table">
            <table class="mc-table">
              <thead><tr><th></th><th>Sản phẩm</th><th>SKU</th><th>Danh mục</th><th>Giá</th><th>Tồn</th><th>Trạng thái</th></tr></thead>
              <tbody>
                <tr v-for="product in filteredProducts" :key="product.id" :class="{ disabled: product.stock <= 0 }">
                  <td><input :checked="picker.selected[product.id] !== undefined" :disabled="product.stock <= 0" type="checkbox" @change="togglePickerProduct(product, $event.target.checked)"></td>
                  <td class="product-cell"><span class="prod-thumb"><img v-if="isImageUrl(product.image)" :src="product.image" alt=""><AppIcon v-else :name="product.image || 'box'" /></span><b>{{ product.name }}</b></td>
                  <td><span class="code-badge">{{ product.sku }}</span></td>
                  <td>{{ product.category }}</td>
                  <td>{{ money(product.price) }}</td>
                  <td>{{ product.stock }}</td>
                  <td>{{ product.stock > 0 ? 'Đang bán' : 'Hết hàng' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="selected-box"><b>Đã chọn {{ selectedPickerProducts.length }} sản phẩm</b><div v-for="product in selectedPickerProducts" :key="product.id"><span>{{ product.name }}</span><input v-model.number="picker.selected[product.id]" type="number" min="1"></div></div>
        </div>
        <footer><button type="button" class="mc-cancel" @click="modal.picker = false">Hủy</button><button type="button" class="mc-primary" @click="applyPickerProducts"><AppIcon name="check" />Thêm vào combo</button></footer>
      </div>
    </div>

    <form v-if="modal.notify" class="modal-backdrop" @click.self="modal.notify = false" @submit.prevent="saveNotification">
      <div class="modal-card">
        <header><h2>{{ editing.notify ? 'Sửa' : 'Tạo' }} <em>thông báo</em></h2><button type="button" @click="modal.notify = false"><AppIcon name="x" /></button></header>
        <div class="modal-body">
          <label>Áp dụng Mẫu thông báo (Tùy chọn)
            <select @change="applyTemplateToForm($event.target.value, 'notify')">
              <option value="">-- Chọn mẫu thông báo --</option>
              <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.code }} - {{ t.name }}</option>
            </select>
          </label>
          <label>Tiêu đề *<input v-model="notifyForm.title" required placeholder="Bạn vừa nhận voucher mới" class="large-input"></label>
          <label>Nội dung
            <div v-if="isHtmlContent(notifyForm.body)" class="html-content-badge">
              <AppIcon name="layout" :size="16" /> Đã áp dụng mẫu HTML
              <div class="html-actions">
                <button type="button" class="mc-outline" @click="openPreviewHtml(notifyForm.title, notifyForm.body)">Xem trước</button>
                <button type="button" class="mc-outline" @click="openUnlayerEditor(notifyForm.body, (val) => notifyForm.body = val)">Sửa thiết kế</button>
                <button type="button" class="mc-cancel" @click="notifyForm.body = ''">Xóa / Soạn lại</button>
              </div>
            </div>
            <textarea v-else v-model="notifyForm.body" required rows="12" class="large-textarea" />
          </label>
          <div class="form-row"><label>Voucher liên quan<select v-model="notifyForm.relatedVoucherId"><option value="">Không gắn voucher</option><option v-for="voucher in vouchers" :key="voucher.id" :value="voucher.id">{{ voucher.code }} - {{ voucher.name }}</option></select></label><label>Kiểu gửi<select v-model="notifyForm.sendType"><option value="NOW">Gửi ngay</option><option value="SCHEDULED">Hẹn lịch</option><option value="DRAFT">Lưu nháp</option></select></label></div>
          <label v-if="notifyForm.sendType === 'SCHEDULED'">Thời gian gửi<input v-model="notifyForm.scheduledAt" type="datetime-local"></label>
          <div class="choice-grid"><button type="button" :class="{ selected: notifyForm.targetType === 'MANUAL' }" @click="notifyForm.targetType = 'MANUAL'">Chọn user</button><button type="button" :class="{ selected: notifyForm.targetType === 'ALL' }" @click="notifyForm.targetType = 'ALL'">Toàn bộ</button><button type="button" :class="{ selected: notifyForm.targetType === 'SEGMENT' }" @click="notifyForm.targetType = 'SEGMENT'">Theo điều kiện</button></div>
          <template v-if="notifyForm.targetType === 'MANUAL'">
            <button type="button" class="mc-outline" style="margin-bottom: 15px;" @click="showNotifyUserPicker = !showNotifyUserPicker">
              <AppIcon :name="showNotifyUserPicker ? 'chevronUp' : 'chevronDown'" :size="16" />
              {{ showNotifyUserPicker ? 'Ẩn danh sách tìm kiếm' : 'Hiển thị tìm người dùng' }}
            </button>
            <div v-show="showNotifyUserPicker" class="user-picker-wrapper">
              <label>Tìm người dùng<input v-model="notifyUserQuery" placeholder="Tên hoặc email..."></label>
              <div class="user-pick-list">
                <label v-for="user in filteredNotificationUsers" :key="user.id" class="user-pick-item"><input v-model="notifyForm.targetUserIds" type="checkbox" :value="user.id"><span>{{ user.avatar }}</span><b>{{ user.name }}</b><small>{{ user.email }}</small></label>
                <div v-if="!filteredNotificationUsers.length" class="user-pick-empty">Không tìm thấy người dùng phù hợp.</div>
              </div>
            </div>
          </template>
          <label v-if="notifyForm.targetType === 'SEGMENT'">Nhóm người dùng<select v-model="notifyForm.segmentKey"><option v-for="segment in PROMOTION_SEGMENTS" :key="segment.value" :value="segment.value">{{ segment.label }}</option></select></label>
          <div class="checkbox-grid"><label class="check-line"><input v-model="notifyForm.channels" type="checkbox" value="NOTIFICATION">Notification</label><label class="check-line"><input v-model="notifyForm.channels" type="checkbox" value="EMAIL">Email</label></div>
        </div>
        <footer><button type="button" class="mc-cancel" @click="modal.notify = false">{{ editing.notify?.status === 'SENT' ? 'Đóng' : 'Hủy' }}</button><button v-if="editing.notify?.status !== 'SENT'" class="mc-primary"><AppIcon name="send" />Lưu thông báo</button></footer>
      </div>
    </form>

    <form v-if="modal.template" class="modal-backdrop" @click.self="modal.template = false" @submit.prevent="saveTemplate">
      <div class="modal-card">
        <header><h2>{{ editing.template ? 'Sửa' : 'Tạo' }} <em>mẫu thông báo</em></h2><button type="button" @click="modal.template = false"><AppIcon name="x" /></button></header>
        <div class="modal-body">
          <div class="form-row">
            <label>Tên mẫu *<input v-model="templateForm.name" required placeholder="Gửi mã giảm giá ngày lễ"></label>
            <label>Mã mẫu *<input v-model="templateForm.code" required placeholder="HOLIDAY_COUPON_01"></label>
          </div>
          <label>Tiêu đề mẫu (Template)<input v-model="templateForm.titleTemplate" placeholder="Tặng bạn mã ưu đãi {{coupon_code}}"></label>
          <label>Nội dung mẫu (Template)
            <div v-if="isHtmlContent(templateForm.bodyTemplate)" class="html-content-badge">
              <AppIcon name="layout" :size="16" /> Đã có thiết kế mẫu HTML
              <div class="html-actions">
                <button type="button" class="mc-outline" @click="openPreviewHtml(templateForm.titleTemplate, templateForm.bodyTemplate)">Xem trước</button>
                <button type="button" class="mc-outline" @click="openUnlayerEditor(templateForm.bodyTemplate, (val) => templateForm.bodyTemplate = val)">Sửa thiết kế</button>
                <button type="button" class="mc-cancel" @click="templateForm.bodyTemplate = ''">Xóa / Soạn lại</button>
              </div>
            </div>
            <textarea v-else v-model="templateForm.bodyTemplate" rows="4" placeholder="Nhập nội dung mẫu. Có thể chứa biến như {{user_name}}..." />
          </label>
          <button v-if="!isHtmlContent(templateForm.bodyTemplate)" type="button" class="mc-outline" style="width:100%; justify-content:center; margin-top: 10px;" @click="openUnlayerEditor('', (val) => templateForm.bodyTemplate = val)"><AppIcon name="layout" /> Thiết kế Email (Kéo thả)</button>
        </div>
        <footer><button type="button" class="mc-cancel" @click="modal.template = false">Hủy</button><button class="mc-primary"><AppIcon name="save" />Lưu mẫu thông báo</button></footer>
      </div>
    </form>

    <div v-if="modal.unlayer" class="modal-backdrop unlayer-layer">
      <div class="modal-card modal-unlayer">
        <header><h2>Thiết kế Email</h2><div class="actions" style="display: flex; gap: 8px;"><button class="mc-cancel" @click="modal.unlayer = false">Hủy</button><button class="mc-primary" @click="saveUnlayerDesign"><AppIcon name="save" />Hoàn tất & Lấy mã HTML</button></div></header>
        <div class="modal-body unlayer-body">
          <div id="unlayer-editor-container" style="height: 100%; width: 100%;"></div>
        </div>
      </div>
    </div>

    <div v-if="modal.previewTemplate" class="modal-backdrop" @click.self="modal.previewTemplate = false">
      <div class="modal-card">
        <header><h2>Xem trước <em>{{ editing.previewTemplate?.name }}</em></h2><button type="button" @click="modal.previewTemplate = false"><AppIcon name="x" /></button></header>
        <div class="modal-body preview-body">
          <div class="preview-title">
            <AppIcon name="bell" :size="18" />
            <span>{{ editing.previewTemplate?.titleTemplate }}</span>
          </div>
          <!-- Khung wrapper hỗ trợ kéo thả resize để test responsive (tối thiểu 320px, tối đa 100%) -->
          <div class="preview-iframe-wrapper">
            <iframe 
              class="preview-content-iframe" 
              :srcdoc="getPreviewHtml(editing.previewTemplate?.bodyTemplate)"
              frameborder="0"
            ></iframe>
          </div>
        </div>
        <footer><button type="button" class="mc-cancel" @click="modal.previewTemplate = false">Đóng</button></footer>
      </div>
    </div>

    <aside v-if="publish.voucher" class="drawer-backdrop" @click.self="publish.voucher = null">
      <div class="publish-drawer">
        <header><strong>Phát hành voucher <em>{{ publish.voucher.code }}</em></strong><button type="button" @click="publish.voucher = null"><AppIcon name="x" /></button></header>
        <div class="drawer-body">
          <div class="segment-choice">
            <button :class="{ selected: publish.segment === 'one' }" @click="publish.segment = 'one'"><AppIcon name="user" /><span>Một người<small>Tìm và cấp cho 1 user cụ thể</small></span></button>
            <button :class="{ selected: publish.segment === 'many' }" @click="publish.segment = 'many'"><AppIcon name="users" /><span>Nhiều người<small>Chọn danh sách user</small></span></button>
            <button :class="{ selected: publish.segment === 'all' }" @click="publish.segment = 'all'"><AppIcon name="globe" /><span>Toàn bộ người dùng<small>Phát hàng loạt</small></span></button>
            <button :class="{ selected: publish.segment === 'cond' }" @click="publish.segment = 'cond'"><AppIcon name="filter" /><span>Theo điều kiện<small>Khách mới, bỏ giỏ, không hoạt động</small></span></button>
          </div>
          <label v-if="publish.segment === 'one' || publish.segment === 'many'">Tìm người dùng<input v-model="publish.userQuery" placeholder="Email hoặc tên..."></label>
          <div v-if="publish.segment === 'one' || publish.segment === 'many'" class="user-pick-list compact-users">
            <label v-for="user in filteredUsers" :key="user.id" class="user-pick-item">
              <input
                v-if="publish.segment === 'one'"
                type="radio"
                name="publish-user"
                :checked="publish.selectedUserIds[0] === user.id"
                @change="publish.selectedUserIds = [user.id]"
              >
              <input v-else v-model="publish.selectedUserIds" type="checkbox" :value="user.id">
              <span>{{ user.avatar }}</span><b>{{ user.name }}</b><small>{{ user.email }}</small>
            </label>
            <div v-if="!filteredUsers.length" class="user-pick-empty">Không tìm thấy người dùng phù hợp.</div>
          </div>
          <div v-if="publish.segment === 'all'" class="warn-box">Bạn sắp phát voucher cho toàn bộ người dùng đủ điều kiện nhận.</div>
          <label v-if="publish.segment === 'cond'">Nhóm người dùng<select v-model="publish.segmentKey"><option v-for="segment in PROMOTION_SEGMENTS" :key="segment.value" :value="segment.value">{{ segment.label }}</option></select></label>
          <div class="checkbox-grid"><label class="check-line"><input v-model="publish.channels" type="checkbox" value="NOTIFICATION">Notification</label><label class="check-line"><input v-model="publish.channels" type="checkbox" value="EMAIL">Email</label></div>
          <label>Áp dụng Mẫu thông báo (Tùy chọn)
            <select @change="applyTemplateToForm($event.target.value, 'publish')">
              <option value="">-- Chọn mẫu thông báo --</option>
              <option v-for="t in promotionTemplates" :key="t.id" :value="t.id">{{ t.code }} - {{ t.name }}</option>
            </select>
          </label>
          <label>Tiêu đề<input v-model="publish.title" class="large-input"></label>
          <label>Nội dung
            <div v-if="isHtmlContent(publish.body)" class="html-content-badge">
              <AppIcon name="layout" :size="16" /> Đã áp dụng mẫu HTML
              <div class="html-actions">
                <button type="button" class="mc-outline" @click="openPreviewHtml(publish.title, publish.body)">Xem trước</button>
                <button type="button" class="mc-outline" @click="openUnlayerEditor(publish.body, (val) => publish.body = val)">Sửa thiết kế</button>
                <button type="button" class="mc-cancel" @click="publish.body = ''">Xóa / Soạn lại</button>
              </div>
            </div>
            <textarea v-else v-model="publish.body" rows="12" class="large-textarea" />
          </label>

          <!-- VOUCHER PREVIEW CARD -->
          <div v-if="selectedPublishVoucher" class="voucher-preview-wrap">
            <div class="vp-label"><AppIcon name="eye" :size="14" /> Xem trước thẻ Voucher (hiển thị với người nhận)</div>
            <div class="vp-card">
              <div class="vp-left">
                <AppIcon name="badgePercent" :size="26" />
              </div>
              <div class="vp-info">
                <div class="vp-name">{{ selectedPublishVoucher.name }}</div>
                <div class="vp-code">{{ selectedPublishVoucher.code }}</div>
                <div class="vp-discount">{{ discountPreviewLabel(selectedPublishVoucher) }}</div>
                <div class="vp-meta">{{ minOrderLabel(selectedPublishVoucher) }}</div>
                <div v-if="selectedPublishVoucher.endDate" class="vp-expiry">HSD: {{ expireDateLabel(selectedPublishVoucher) }}</div>
              </div>
              <div class="vp-badge">VOUCHER</div>
            </div>
          </div>

          <button type="button" class="mc-primary" :disabled="publishing" @click="confirmPublishVoucher"><AppIcon name="send" />Xác nhận phát hành</button>
        </div>
      </div>
    </aside>

    <ConfirmDialog
      :open="Boolean(comboDeleteTarget)"
      title="Xóa combo?"
      :message="comboDeleteTarget
        ? `Bạn có chắc muốn xóa combo “${comboDeleteTarget.name}”? Thao tác này không thể hoàn tác.`
        : ''"
      confirm-label="Xóa combo"
      cancel-label="Hủy"
      :loading="deletingCombo"
      danger
      @close="closeComboDelete"
      @confirm="confirmComboDelete"
    />

    <div
      v-if="toast.message"
      class="mc-toast"
      :class="`mc-toast--${toast.type}`"
      role="status"
      aria-live="polite"
    >
      <AppIcon :name="toast.type === 'error' ? 'alert' : toast.type === 'success' ? 'check' : 'info'" :size="16" />
      {{ toast.message }}
    </div>
  </div>
</template>

<style scoped>
.marketing-center { display: flex; flex-direction: column; gap: 16px; color: #1a2332; }
.mc-primary, .mc-outline, .mc-cancel { border-radius: 8px; border: 1px solid #c9953a; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 34px; }
.mc-primary { background: #c9953a; color: #fff; }
.mc-primary.disabled, .mc-primary:disabled { opacity: .55; cursor: not-allowed; }
.mc-outline, .mc-cancel { background: #fff; color: #c9953a; }
.mc-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.mc-stat { position: relative; background: #fff; border: 1px solid #e8e0d0; border-radius: 8px; padding: 14px 16px; min-height: 96px; }
.stat-icon { position: absolute; right: 14px; top: 14px; color: #c9953a; opacity: .9; }
.mc-stat span { display: block; font-size: 11px; color: #8a7a68; text-transform: uppercase; letter-spacing: .04em; }
.mc-stat strong { display: block; color: #1a2332; font-size: 21px; margin-top: 4px; }
.mc-stat strong.gold, .discount-gold { color: #c9953a; font-weight: 800; }
.mc-stat small { color: #8a7a68; }
.mc-tabs { display: flex; gap: 0; border-bottom: 2px solid #e8e0d0; overflow-x: auto; }
.mc-tabs button { background: transparent; border: 0; border-bottom: 2px solid transparent; margin-bottom: -2px; padding: 10px 18px; color: #8a7a68; font-weight: 700; cursor: pointer; white-space: nowrap; }
.mc-tabs button.active { color: #c9953a; border-bottom-color: #c9953a; }
.mc-card { background: #fff; border: 1px solid #e8e0d0; border-radius: 8px; overflow: hidden; }
.mc-filter { display: flex; gap: 10px; align-items: center; padding: 14px 16px; border-bottom: 1px solid #e8e0d0; flex-wrap: wrap; }
.mc-filter.compact { padding: 0 0 12px; border-bottom: 0; }
.mc-input, .mc-select, .modal-card input, .modal-card select, .modal-card textarea, .publish-drawer input, .publish-drawer select, .publish-drawer textarea { background: #f5f0e8; border: 1px solid #e0d8cc; border-radius: 8px; padding: 8px 11px; font-size: 12px; color: #1a2332; width: 100%; }
.mc-filter > .mc-input { width: 240px; flex: 0 0 240px; }
.mc-filter > .mc-select { width: auto; min-width: 150px; flex: 0 0 auto; }
.mc-filter > .mc-outline { flex: 0 0 auto; }
.modal-card .mc-filter > .mc-input { width: 220px; flex-basis: 220px; }
.mc-table-wrap { overflow: auto; }
.mc-table { width: 100%; border-collapse: collapse; font-size: 12px; min-width: 860px; }
.mc-table th { background: #1a2332; color: #d8d3cc; text-align: left; padding: 11px 14px; white-space: nowrap; }
.mc-table td { padding: 11px 14px; border-bottom: 1px solid #f0e8dc; color: #2a3a4a; vertical-align: middle; }
.mc-table tr:hover td { background: #faf6f0; }
.mc-table tr.disabled { opacity: .55; }
.mc-name { font-weight: 700; color: #1a2332; }
.combo-name-cell { display: flex; align-items: center; gap: 9px; min-width: 180px; }
.combo-name-cell img { width: 42px; height: 34px; object-fit: cover; border-radius: 6px; border: 1px solid #e8e0d0; }
.code-badge { background: #f5f0e8; border: 1px solid #e0d5c0; border-radius: 6px; padding: 3px 9px; font: 700 11px/1.4 monospace; color: #1a2332; }
.type-badge { border-radius: 999px; padding: 3px 10px; font-size: 10px; font-weight: 800; }
.type-public { background: #fef3c7; color: #92400e; }
.type-personal { background: #e0e7ff; color: #3730a3; }
.type-marketing { background: #d1fae5; color: #065f46; }
.sent-count { color: #6b7280; }
.status-badge { border-radius: 999px; padding: 3px 10px; display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; white-space: nowrap; }
.status-badge span { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.status-badge.on { background: #d1fae5; color: #065f46; }
.status-badge.off { background: #f1f0ee; color: #6b7280; }
.status-badge.expired { background: #fee2e2; color: #991b1b; }
.status-badge.scheduled { background: #e0e7ff; color: #3730a3; }
.mc-actions { display: flex; gap: 6px; }
.mc-actions button { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e0d8cc; background: #fff; color: #666; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.mc-actions button.publish { background: #c9953a; border-color: #c9953a; color: #fff; }
.mc-actions button.danger:hover { border-color: #ef4444; color: #ef4444; }
.mc-empty { text-align: center; color: #8a7a68; padding: 28px; }
.pagination { border-top: 1px solid #f0e8dc; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; color: #8a7a68; font-size: 11px; }
.pagination button { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e0d8cc; background: #fff; margin-left: 5px; }
.modal-backdrop, .drawer-backdrop { position: fixed; inset: 0; background: rgba(20,30,45,.5); z-index: 900; display: flex; align-items: center; justify-content: center; padding: 18px; }
.picker-layer { z-index: 910; }
.modal-card { width: min(560px, calc(100vw - 24px)); max-height: calc(100vh - 36px); background: #fff; border-radius: 12px; box-shadow: 0 14px 45px rgba(0,0,0,.18); display: flex; flex-direction: column; }
.modal-lg { width: min(820px, calc(100vw - 24px)); }
.modal-card header, .modal-card footer, .publish-drawer header { padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0e8dc; gap: 10px; flex-shrink: 0; }
.modal-card footer { border-top: 1px solid #f0e8dc; border-bottom: 0; justify-content: flex-end; }
.modal-card h2 { font-size: 18px; color: #1a2332; }
.modal-card em, .publish-drawer em { color: #c9953a; }
.modal-card header > button, .publish-drawer header > button { width: 30px; height: 30px; border-radius: 8px; border: 1px solid #e0d8cc; background: #fff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.modal-body, .drawer-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; flex: 1; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.modal-card label, .publish-drawer label { display: flex; flex-direction: column; gap: 6px; font-size: 11px; font-weight: 800; color: #5a4a3a; text-transform: uppercase; letter-spacing: .04em; }
.check-line { flex-direction: row !important; align-items: center; text-transform: none !important; font-size: 13px !important; letter-spacing: 0 !important; }
.check-line input { width: auto; accent-color: #c9953a; }
.section-title { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 800; color: #1a2332; text-transform: uppercase; letter-spacing: .04em; margin-top: 4px; }
.choice-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.choice-grid button, .segment-choice button { border: 1.5px solid #e0d8cc; border-radius: 8px; background: #fff; padding: 10px 12px; color: #444; font-weight: 800; cursor: pointer; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; text-align: left; }
.choice-grid button.selected, .segment-choice button.selected { border-color: #c9953a; background: #fefaf3; color: #c9953a; }
.choice-grid small, .segment-choice small { color: #8a7a68; font-weight: 500; }
.checkbox-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 14px; }
.user-pick-list { max-height: 230px; overflow: auto; border: 1px solid #e0d8cc; border-radius: 8px; }
.user-pick-list.compact-users { max-height: 180px; }
.user-pick-item { display: grid !important; grid-template-columns: auto 28px 1fr; align-items: center; gap: 8px !important; padding: 9px 12px; border-bottom: 1px solid #f0e8dc; text-transform: none !important; letter-spacing: 0 !important; font-size: 12px !important; }
.user-pick-item:last-child { border-bottom: 0; }
.user-pick-item input { width: auto; }
.user-pick-item span, .prod-thumb { width: 30px; height: 30px; border-radius: 7px; background: #f5f0e8; border: 1px solid #e8e0d0; display: inline-flex; align-items: center; justify-content: center; color: #c9953a; font-weight: 800; }
.prod-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
.user-pick-item small { grid-column: 3; color: #8a7a68; }
.user-pick-empty { padding: 18px 12px; color: #8a7a68; font-size: 12px; text-align: center; }
.add-product { background: #fff; border: 1.5px dashed #c9953a; color: #c9953a; border-radius: 8px; padding: 10px 14px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px; }
.empty-box { border: 1.5px dashed #e0d8cc; border-radius: 8px; padding: 20px; color: #8a7a68; text-align: center; background: #faf7f2; }
.combo-item-card { display: grid; grid-template-columns: 38px 1fr 64px 32px; gap: 12px; align-items: center; background: #f5f0e8; border: 1px solid #e8e0d0; border-radius: 8px; padding: 9px 12px; }
.combo-item-card small { display: block; color: #8a7a68; margin-top: 2px; }
.combo-item-card label { text-transform: none; letter-spacing: 0; gap: 3px; }
.combo-item-card button { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #e0d8cc; background: #fff; cursor: pointer; }
.combo-image-upload { position: relative; min-height: 90px; border: 1.5px dashed #c9953a; border-radius: 8px; background: #fefaf3; display: grid; place-items: center; cursor: pointer; overflow: hidden; }
.combo-image-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.combo-image-upload > span { display: flex; flex-direction: column; align-items: center; gap: 7px; color: #8a6b32; font-size: 12px; text-transform: none; letter-spacing: 0; }
.combo-image-preview { position: relative; width: min(320px, 100%); aspect-ratio: 16 / 9; overflow: hidden; border: 1px solid #e8e0d0; border-radius: 8px; }
.combo-image-preview img { width: 100%; height: 100%; object-fit: cover; }
.combo-image-preview button { position: absolute; top: 8px; right: 8px; width: 30px; height: 30px; border: 0; border-radius: 6px; background: rgba(18, 32, 46, .88); color: #fff; display: grid; place-items: center; cursor: pointer; }
.combo-summary { background: #fefaf3; border: 1px solid #f0dfb8; border-radius: 8px; padding: 11px 14px; display: grid; gap: 6px; }
.combo-summary div { display: flex; justify-content: space-between; }
.combo-summary .save { color: #16a34a; font-weight: 800; border-top: 1px dashed #e0cfa8; padding-top: 8px; }
.picker-table { max-height: 300px; overflow: auto; border: 1px solid #e8e0d0; border-radius: 8px; }
.product-cell { display: flex; align-items: center; gap: 8px; }
.selected-box { border: 1px solid #e8e0d0; border-radius: 8px; background: #faf7f2; padding: 10px; display: grid; gap: 8px; }
.selected-box div { display: grid; grid-template-columns: 1fr 70px; align-items: center; gap: 8px; font-size: 12px; }
.drawer-backdrop { justify-content: flex-end; align-items: stretch; padding: 0; }
.publish-drawer { width: min(400px, 100vw); background: #fff; box-shadow: -8px 0 30px rgba(0,0,0,.13); overflow: auto; }
.segment-choice { display: flex; flex-direction: column; gap: 8px; }
.segment-choice button { flex-direction: row; align-items: center; }
.segment-choice span { display: flex; flex-direction: column; }
.warn-box { background: #fef9ee; border: 1px solid #f5d38a; border-radius: 8px; padding: 11px 13px; color: #92400e; font-size: 12px; }
.html-content-badge { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; background: #faf8f5; padding: 12px; border-radius: 8px; border: 1px dashed #c9953a; color: #5a4a3a; font-weight: 600; font-size: 13px; }
.html-actions { display: flex; gap: 8px; }
.mc-toast { position: fixed; right: 22px; bottom: 22px; z-index: 920; background: #1a2332; color: #fff; border-radius: 8px; padding: 10px 14px; box-shadow: 0 10px 28px rgba(0,0,0,.18); display: inline-flex; align-items: center; gap: 8px; }
.mc-toast--success { background: #176b4d; }
.mc-toast--error { background: #a83232; }
.preview-body { background: #faf7f2; padding: 24px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; }
.preview-title { width: 100%; display: flex; align-items: center; gap: 10px; font-weight: 800; color: #1a2332; font-size: 16px; margin-bottom: 12px; flex-shrink: 0; }
.preview-iframe-wrapper { width: 100%; min-width: 320px; max-width: 100%; height: 500px; min-height: 300px; max-height: 75vh; resize: both; overflow: hidden; background: #fff; border: 1px solid #e0d8cc; border-radius: 8px; }
.preview-content-iframe { width: 100%; height: 100%; display: block; border: none; }
.unlayer-layer { z-index: 1000; }
.modal-unlayer { width: 100%; max-width: 1400px; height: 95vh; display: flex; flex-direction: column; }
.modal-unlayer header { display: flex; justify-content: space-between; align-items: center; }
.modal-unlayer .actions { display: flex; gap: 10px; }
.unlayer-body { padding: 0 !important; overflow: hidden; background: #f4f4f4; flex-grow: 1; }
.large-input { font-size: 16px; padding: 12px; font-weight: 600; }
.large-textarea { font-size: 15px; padding: 12px; line-height: 1.6; resize: vertical; }
.user-picker-wrapper { background: #f4f6f8; padding: 15px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #e1e4e8; }
@media (max-width: 900px) {
  .mc-stats { grid-template-columns: repeat(2, 1fr); }
  .choice-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .mc-stats, .form-row, .checkbox-grid { grid-template-columns: 1fr; }
  .mc-filter > .mc-input, .mc-filter > .mc-select, .mc-filter > .mc-outline { width: 100%; flex: 1 1 100%; }
  .modal-backdrop { align-items: flex-start; padding: 12px; }
  .combo-item-card { grid-template-columns: 34px 1fr; }
  .combo-item-card label, .combo-item-card button { grid-column: 2; }
}

/* ---- VOUCHER PREVIEW CARD ---- */
.voucher-preview-wrap { margin: 8px 0 4px; }
.vp-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #8a7a68; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 8px; }
.vp-card {
  display: grid;
  grid-template-columns: 60px 1fr 56px;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #fffbf2 0%, #fff8ea 100%);
  border: 1.5px dashed #c9953a;
  border-radius: 14px;
  padding: 14px 16px;
  position: relative;
  overflow: hidden;
}
.vp-card::before {
  content: '';
  position: absolute;
  left: 59px;
  top: 0; bottom: 0;
  width: 1px;
  border-left: 2px dashed #e8d4aa;
}
.vp-left {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: color-mix(in srgb, #c9953a 18%, #fff);
  color: #8a5c00;
}
.vp-info { min-width: 0; }
.vp-name { font-size: 0.95rem; font-weight: 700; color: #1a2332; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vp-code { font-size: 0.85rem; font-weight: 800; color: #c9953a; letter-spacing: .08em; margin-top: 2px; }
.vp-discount { font-size: 1.1rem; font-weight: 800; color: #b8630a; margin-top: 4px; }
.vp-meta { font-size: 0.75rem; color: #8a7a68; margin-top: 2px; }
.vp-expiry { font-size: 0.72rem; color: #be123c; margin-top: 2px; font-weight: 600; }
.vp-badge {
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: .12em;
  color: #c9953a;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  opacity: 0.45;
  user-select: none;
}
</style>
