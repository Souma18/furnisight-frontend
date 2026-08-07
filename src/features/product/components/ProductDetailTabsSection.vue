<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { computed, toRef } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useProductTabs } from '../composables/useProductTabs'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['switch-tab', 'update-review-field', 'submit-review', 'open-login'])
const props = defineProps({
  product: { type: Object, required: true },
  activeVariant: { type: Object, default: null },
  activeTab: { type: String, required: true },
  reviewEligibility: { type: Object, required: true },
  reviewForm: { type: Object, required: true },
  reviewSubmitting: { type: Boolean, default: false },
  reviewSubmitError: { type: String, default: '' },
  reviewSubmitSuccess: { type: String, default: '' },
  reviewCanSubmit: { type: Boolean, default: false },
  reviewIsAuthenticated: { type: Boolean, default: false },
})

const { t } = useI18n()
const {
  reviewCountLabel,
  specsRows,
  reviewBars,
} = useProductTabs(toRef(props, 'product'), toRef(props, 'activeVariant'))

const reviewGateMessage = computed(() => {
  if (props.reviewEligibility.loading) return t('productDetail.review.checking')
  if (props.reviewEligibility.error) return props.reviewEligibility.error
  if (!props.reviewIsAuthenticated) return t('productDetail.review.loginReq')
  if (!props.reviewEligibility.purchased) return t('productDetail.review.purchaseReq')
  if (!props.reviewEligibility.orderItemId) return t('productDetail.review.noOrder')
  return ''
})

const reviewFormEnabled = computed(() => Boolean(
  props.reviewIsAuthenticated &&
  props.reviewEligibility.purchased &&
  props.reviewEligibility.orderItemId &&
  !props.reviewEligibility.loading,
))

const reviewRatingEnabled = computed(() => Boolean(
  props.reviewIsAuthenticated &&
  !props.reviewSubmitting,
))

function updateReviewField(field, value) {
  emit('update-review-field', { field, value })
}
</script>

<template>
  <section class="pd-tabs" aria-label="Thông tin chi tiết sản phẩm">
    <div class="nav" aria-label="Chuyển nội dung sản phẩm">
      <AppButton type="button" :class="{ active: activeTab === 'desc' }" @click="emit('switch-tab', 'desc')">
        {{ t('productDetail.tabs.desc') }}
      </AppButton>
      <AppButton type="button" :class="{ active: activeTab === 'spec' }" @click="emit('switch-tab', 'spec')">
        {{ t('productDetail.tabs.spec') }}
      </AppButton>
      <AppButton type="button" :class="{ active: activeTab === 'review' }" @click="emit('switch-tab', 'review')">
        {{ t('productDetail.tabs.review', { count: reviewCountLabel }) }}
      </AppButton>
    </div>
    <div v-if="activeTab === 'desc'" class="pd-section-layout desc-grid">
      <div class="pd-content pd-story-panel">
        <span class="pd-section-eyebrow">{{ t('productDetail.desc.overview') }}</span>
        <h2>{{ t('productDetail.desc.title') }}</h2>
        <p class="pd-description-text">{{ product.description }}</p>
        <ul>
          <li v-for="item in product.features" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div class="spec-table pd-spec-summary">
        <div class="spec-head">{{ t('productDetail.spec.basic') }}</div>
        <div v-for="row in specsRows.slice(0, 4)" :key="`sum-desc-${row.key}`" class="spec-row">
          <div class="spec-key">{{ row.key }}</div>
          <div class="spec-val">{{ row.value }}</div>
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'spec'" class="pd-section-layout pd-spec">
      <div class="spec-table">
        <div v-for="row in specsRows" :key="`det-${row.key}`" class="spec-row">
          <div class="spec-key">{{ row.key }}</div>
          <div class="spec-val">{{ row.value }}</div>
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'review'" class="pd-section-layout pd-review">
      <div class="review-summary">
        <div class="review-score">
          <p class="score">{{ product.rating ? Number(product.rating).toFixed(1) : '5.0' }}</p>
          <p class="stars" aria-label="Đánh giá trung bình">
            <AppIcon
              v-for="star in 5"
              :key="`summary-star-${star}`"
              name="star"
              :size="19"
              :class="{ active: star <= Math.round(product.rating || 5) }"
            />
          </p>
          <p class="count">{{ reviewCountLabel }} </p>
        </div>
        <div class="review-bars">
          <div v-for="bar in reviewBars" :key="`bar-${bar.star}`" class="bar-row">
            <span class="bar-label">
              {{ bar.star }}
              <AppIcon name="star" :size="12" />
            </span>
            <span class="bar-track"><span class="bar-fill" :style="{ width: `${bar.percent}%` }"></span></span>
            <span class="bar-count">{{ bar.count }}</span>
          </div>
        </div>
      </div>
      <form class="review-form" @submit.prevent="emit('submit-review')">
        <div class="review-form-head">
          <div>
            <h3>{{ t('productDetail.review.write') }}</h3>
            <p v-if="reviewGateMessage" class="review-gate">{{ reviewGateMessage }}</p>
            <p v-else class="review-gate ready">{{ t('productDetail.review.readyMsg') }}</p>
          </div>
          <AppButton
            v-if="!reviewIsAuthenticated && !reviewEligibility.loading"
            type="button"
            class="review-login-btn"
            @click="emit('open-login')"
          >
            {{ t('productDetail.review.loginBtn') }}
          </AppButton>
        </div>
        <div class="rating-picker" aria-label="Chọn số sao">
          <AppButton
            v-for="star in 5"
            :key="`pick-star-${star}`"
            variant="unstyled"
            size="unstyled"
            class="star-pick"
            :class="{ active: star <= Number(reviewForm.rating || 0) }"
            :aria-label="`Chọn ${star} sao`"
            :aria-pressed="star === Number(reviewForm.rating || 0)"
            :disabled="!reviewRatingEnabled"
            @click="updateReviewField('rating', star)"
          >
            <AppIcon name="star" :size="22" />
          </AppButton>
          <span class="rating-picked-label">{{ t('productDetail.review.selectedStars', { n: Number(reviewForm.rating || 0) }) }}</span>
        </div>
        <AppInput
          class="review-title-input"
          type="text"
          :placeholder="t('productDetail.review.titlePlaceholder')"
          :value="reviewForm.title"
          :disabled="!reviewFormEnabled || reviewSubmitting"
          maxlength="255"
          @input="updateReviewField('title', $event.target.value)"
        />
        <textarea
          class="review-content-input"
          rows="4"
          :placeholder="t('productDetail.review.contentPlaceholder')"
          :value="reviewForm.content"
          :disabled="!reviewFormEnabled || reviewSubmitting"
          @input="updateReviewField('content', $event.target.value)"
        ></textarea>
        <div class="review-form-actions">
          <p v-if="reviewSubmitError" class="review-submit-msg error">{{ reviewSubmitError }}</p>
          <p v-else-if="reviewSubmitSuccess" class="review-submit-msg success">{{ reviewSubmitSuccess }}</p>
          <span v-else></span>
          <AppButton type="submit" class="review-submit-btn" :disabled="!reviewCanSubmit">
            {{ reviewSubmitting ? t('productDetail.review.submitting') : t('productDetail.review.submitBtn') }}
          </AppButton>
        </div>
      </form>
      <div v-for="item in product.reviews || []" :key="item.id" class="review-card">
        <div class="review-head">
          <AppImage v-if="item.avatar" :src="item.avatar" alt="Avatar" class="avatar-img avatar"  />
          <span v-else class="avatar">{{ (item.userName || item.user || 'K').slice(0, 1).toUpperCase() }}</span>
          <div>
            <p class="name">{{ item.userName || item.user || t('productDetail.review.customer') }}</p>
            <p class="date">{{ item.createdAtFormatted || item.createdAt }}</p>
          </div>
          <span class="stars" aria-label="Đánh giá">
            <AppIcon
              v-for="star in 5"
              :key="`${item.id}-star-${star}`"
              name="star"
              :size="13"
              :class="{ active: star <= Math.round(item.rating || 5) }"
            />
          </span>
        </div>
        <p v-if="item.title" class="review-title">{{ item.title }}</p>
        <p class="text">{{ item.comment }}</p>
        <div v-if="item.images?.length" class="review-images">
          <AppImage v-for="img in item.images" :key="`${item.id}-${img}`" :src="img" class="review-image" />
        </div>
      </div>
    </div>
    <div v-else class="pd-content muted">{{ t('productDetail.muted') }}</div>
  </section>
</template>
