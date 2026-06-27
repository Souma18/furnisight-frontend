<script setup>
import '../../styles/admin-marketing.css'
import AppInput from '@shared/ui/AppInput.vue'
import AppButton from '@shared/ui/AppButton.vue'
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
import { useToast } from '@shared/composables/useToast'
import { useAdminPromotionUsers } from '../../composables/useAdminPromotionUsers'
import { useAdminVouchers } from '../../composables/useAdminVouchers'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'

import AdminVoucherTab from '../../components/promotion/views/AdminVoucherTab.vue'
import AdminCampaignTab from '../../components/promotion/views/AdminCampaignTab.vue'
import AdminComboTab from '../../components/promotion/views/AdminComboTab.vue'
import AdminNotifyTab from '../../components/promotion/views/AdminNotifyTab.vue'
import AdminTemplateTab from '../../components/promotion/views/AdminTemplateTab.vue'

import AdminVoucherForm from '../../components/promotion/AdminVoucherForm.vue'
import AdminCampaignFormModal from '../../components/promotion/modals/AdminCampaignFormModal.vue'
import AdminComboFormModal from '../../components/promotion/modals/AdminComboFormModal.vue'
import AdminNotifyFormModal from '../../components/promotion/modals/AdminNotifyFormModal.vue'
import AdminTemplateFormModal from '../../components/promotion/modals/AdminTemplateFormModal.vue'
import AdminPublishVoucherDrawer from '../../components/promotion/modals/AdminPublishVoucherDrawer.vue'
import AdminProductPickerModal from '../../components/promotion/modals/AdminProductPickerModal.vue'

const tabs = ADMIN_PROMOTION_TABS
const loading = ref(false)
const saving = ref(false)
const { show: notify } = useToast()
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
        <AppButton variant="primary"></AppButton>
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
      <AppButton
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </AppButton>
    </nav>

    <AdminVoucherTab
      v-if="activeTab === 'voucher'"
      :vouchers="vouchers"
      :filters="filters.voucher"
      :loading="loading"
      @load="loadVoucherData"
      @open-modal="openVoucherModal"
      @open-publish="openPublishDrawer"
      @delete="deleteVoucher"
    />

    <AdminCampaignTab
      v-if="activeTab === 'campaign'"
      :campaigns="filteredCampaigns"
      :filters="filters.campaign"
      @load="loadCampaigns"
      @open-modal="openCampaignModal"
      @delete="deleteCampaign"
    />

    <AdminComboTab
      v-if="activeTab === 'combo'"
      :combos="filteredCombos"
      :filters="filters.combo"
      @load="loadCombos"
      @open-modal="openComboModal"
      @delete="requestComboDelete"
    />

    <AdminNotifyTab
      v-if="activeTab === 'notify'"
      :notifications="filteredNotifications"
      :filters="filters.notify"
      @load="loadNotifications"
      @open-modal="openNotifyModal"
      @delete="deleteNotification"
    />

    <AdminTemplateTab
      v-if="activeTab === 'template'"
      :templates="filteredTemplates"
      :filters="filters.template"
      @load="loadTemplates"
      @open-preview="openPreviewModal"
      @open-modal="openTemplateModal"
      @delete="deleteTemplate"
    />

    <AdminVoucherForm
      :show="modal.voucher"
      :is-editing="editing.voucher"
      :form="voucherForm"
      :saving="saving"
      @close="modal.voucher = false"
      @submit="saveVoucher"
    />

    <AdminCampaignFormModal
      :show="modal.campaign"
      :is-editing="editing.campaign"
      :form="campaignForm"
      :vouchers="vouchers"
      :templates="promotionTemplates"
      :users="filteredCampaignUsers"
      v-model:userQuery="campaignUserQuery"
      @close="modal.campaign = false"
      @submit="saveCampaign"
      @apply-template="(id) => applyTemplateToForm(id, 'campaign')"
      @open-preview="openPreviewHtml"
      @open-unlayer="openUnlayerEditor"
    >
      <template #voucher-preview>
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
      </template>
    </AdminCampaignFormModal>

    <AdminComboFormModal
      :show="modal.combo"
      :is-editing="editing.combo"
      :form="comboForm"
      :saving="saving"
      :combo-original-amount="comboOriginalAmount"
      :combo-final-amount="comboFinalAmount"
      :combo-saved-amount="comboSavedAmount"
      @close="closeComboModal"
      @submit="saveCombo"
      @image-change="onComboImageChange"
      @remove-image="removeComboImage"
      @open-product-picker="openProductPicker"
      @remove-item="removeComboItem"
    />

    <AdminProductPickerModal
      :show="modal.picker"
      :picker="picker"
      :categories="productCategories"
      :products="filteredProducts"
      :selected-products="selectedPickerProducts"
      @close="modal.picker = false"
      @apply="applyPickerProducts"
      @toggle-product="togglePickerProduct"
    />

    <AdminNotifyFormModal
      :show="modal.notify"
      :is-editing="editing.notify"
      :form="notifyForm"
      :vouchers="vouchers"
      :templates="templates"
      :users="filteredNotificationUsers"
      v-model:userQuery="notifyUserQuery"
      @close="modal.notify = false"
      @submit="saveNotification"
      @apply-template="(id) => applyTemplateToForm(id, 'notify')"
      @open-preview="openPreviewHtml"
      @open-unlayer="openUnlayerEditor"
    />

    <AdminTemplateFormModal
      :show="modal.template"
      :is-editing="editing.template"
      :form="templateForm"
      @close="modal.template = false"
      @submit="saveTemplate"
      @open-preview="openPreviewHtml"
      @open-unlayer="openUnlayerEditor"
    />

    <AdminPublishVoucherDrawer
      :show="!!publish.voucher"
      :publish="publish"
      :users="filteredUsers"
      :templates="promotionTemplates"
      :publishing="publishing"
      @close="publish.voucher = null"
      @submit="confirmPublishVoucher"
      @apply-template="(id) => applyTemplateToForm(id, 'publish')"
      @open-preview="openPreviewHtml"
      @open-unlayer="openUnlayerEditor"
    />

    <div v-if="modal.unlayer" class="modal-backdrop unlayer-layer">
      <div class="modal-card modal-unlayer">
        <header><h2>Thiết kế Email</h2><div class="actions" style="display: flex; gap: 8px;"><AppButton variant="cancel"></AppButton><AppButton variant="primary"></AppButton></div></header>
        <div class="modal-body unlayer-body">
          <div id="unlayer-editor-container" style="height: 100%; width: 100%;"></div>
        </div>
      </div>
    </div>

    <div v-if="modal.previewTemplate" class="modal-backdrop" @click.self="modal.previewTemplate = false">
      <div class="modal-card">
        <header><h2>Xem trước <em>{{ editing.previewTemplate?.name }}</em></h2><AppButton type="button" @click="modal.previewTemplate = false"><AppIcon name="x" /></AppButton></header>
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
        <footer><AppButton variant="cancel"></AppButton></footer>
      </div>
    </div>

    <aside v-if="publish.voucher" class="drawer-backdrop" @click.self="publish.voucher = null">
      <div class="publish-drawer">
        <header><strong>Phát hành voucher <em>{{ publish.voucher.code }}</em></strong><AppButton type="button" @click="publish.voucher = null"><AppIcon name="x" /></AppButton></header>
        <div class="drawer-body">
          <div class="segment-choice">
            <AppButton :class="{ selected: publish.segment === 'one' }" @click="publish.segment = 'one'"><AppIcon name="user" /><span>Một người<small>Tìm và cấp cho 1 user cụ thể</small></span></AppButton>
            <AppButton :class="{ selected: publish.segment === 'many' }" @click="publish.segment = 'many'"><AppIcon name="users" /><span>Nhiều người<small>Chọn danh sách user</small></span></AppButton>
            <AppButton :class="{ selected: publish.segment === 'all' }" @click="publish.segment = 'all'"><AppIcon name="globe" /><span>Toàn bộ người dùng<small>Phát hàng loạt</small></span></AppButton>
            <AppButton :class="{ selected: publish.segment === 'cond' }" @click="publish.segment = 'cond'"><AppIcon name="filter" /><span>Theo điều kiện<small>Khách mới, bỏ giỏ, không hoạt động</small></span></AppButton>
          </div>
          <label v-if="publish.segment === 'one' || publish.segment === 'many'">Tìm người dùng<AppInput v-model="publish.userQuery" placeholder="Email hoặc tên..."/></label>
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
          <label>Tiêu đề<AppInput v-model="publish.title" class="large-input"/></label>
          <label>Nội dung
            <div v-if="isHtmlContent(publish.body)" class="html-content-badge">
              <AppIcon name="layout" :size="16" /> Đã áp dụng mẫu HTML
              <div class="html-actions">
                <AppButton type="button" class="mc-outline" @click="openPreviewHtml(publish.title, publish.body)">Xem trước</AppButton>
                <AppButton type="button" class="mc-outline" @click="openUnlayerEditor(publish.body, (val) => publish.body = val)">Sửa thiết kế</AppButton>
                <AppButton variant="cancel"></AppButton>
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

          <AppButton variant="primary"></AppButton>
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
  </div>
</template>
