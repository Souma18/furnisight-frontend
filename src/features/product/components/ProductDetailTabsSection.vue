<script setup>
import { computed, toRef } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useProductTabs } from '../composables/useProductTabs'

const emit = defineEmits(['switch-tab', 'update-review-field', 'submit-review', 'open-login'])
const props = defineProps({
  product: { type: Object, required: true },
  activeTab: { type: String, required: true },
  reviewEligibility: { type: Object, required: true },
  reviewForm: { type: Object, required: true },
  reviewSubmitting: { type: Boolean, default: false },
  reviewSubmitError: { type: String, default: '' },
  reviewSubmitSuccess: { type: String, default: '' },
  reviewCanSubmit: { type: Boolean, default: false },
  reviewIsAuthenticated: { type: Boolean, default: false },
})

const {
  reviewCountLabel,
  specsRows,
  reviewBars,
} = useProductTabs(toRef(props, 'product'))

const reviewGateMessage = computed(() => {
  if (props.reviewEligibility.loading) return 'Đang kiểm tra điều kiện đánh giá...'
  if (props.reviewEligibility.error) return props.reviewEligibility.error
  if (!props.reviewIsAuthenticated) return 'Đăng nhập để kiểm tra điều kiện đánh giá.'
  if (!props.reviewEligibility.purchased) return 'Bạn cần mua và nhận sản phẩm trước khi đánh giá.'
  return ''
})

function updateReviewField(field, value) {
  emit('update-review-field', { field, value })
}
</script>

<template>
  <section class="pd-tabs">
    <div class="nav">
      <button type="button" :class="{ active: activeTab === 'desc' }" @click="emit('switch-tab', 'desc')">
        Mô tả sản phẩm
      </button>
      <button type="button" :class="{ active: activeTab === 'spec' }" @click="emit('switch-tab', 'spec')">
        Thông số kỹ thuật
      </button>
      <button type="button" :class="{ active: activeTab === 'review' }" @click="emit('switch-tab', 'review')">
        Đánh giá ({{ reviewCountLabel }})
      </button>
    </div>
    <div v-if="activeTab === 'desc'" class="desc-grid">
      <div class="content">
        <h2>Mô tả sản phẩm</h2>
        <p style="white-space: pre-line;">{{ product.description }}</p>
        <ul>
          <li v-for="item in product.features" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div class="spec-table">
        <div class="spec-head">Thông số cơ bản</div>
        <div v-for="row in specsRows.slice(0, 4)" :key="`sum-desc-${row.key}`" class="spec-row">
          <div class="spec-key">{{ row.key }}</div>
          <div class="spec-val">{{ row.value }}</div>
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'spec'" class="pd-spec">
      <div class="spec-table">
        <div class="spec-head">Chi tiết kỹ thuật đầy đủ</div>
        <div v-for="row in specsRows" :key="`det-${row.key}`" class="spec-row">
          <div class="spec-key">{{ row.key }}</div>
          <div class="spec-val">{{ row.value }}</div>
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'review'" class="pd-review">
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
          <p class="count">{{ reviewCountLabel }} đánh giá</p>
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
            <h3>Viết đánh giá</h3>
            <p v-if="reviewGateMessage" class="review-gate">{{ reviewGateMessage }}</p>
            <p v-else class="review-gate ready">Chia sẻ trải nghiệm thực tế của bạn về sản phẩm.</p>
          </div>
          <button
            v-if="!reviewIsAuthenticated && !reviewEligibility.loading"
            type="button"
            class="review-login-btn"
            @click="emit('open-login')"
          >
            Đăng nhập
          </button>
        </div>
        <div class="rating-picker" aria-label="Chọn số sao">
          <button
            v-for="star in 5"
            :key="`pick-star-${star}`"
            type="button"
            class="star-pick"
            :class="{ active: star <= Number(reviewForm.rating || 0) }"
            :disabled="!reviewEligibility.purchased || reviewSubmitting"
            @click="updateReviewField('rating', star)"
          >
            <AppIcon name="star" :size="22" />
          </button>
        </div>
        <input
          class="review-title-input"
          type="text"
          placeholder="Tiêu đề đánh giá"
          :value="reviewForm.title"
          :disabled="!reviewEligibility.purchased || reviewSubmitting"
          maxlength="255"
          @input="updateReviewField('title', $event.target.value)"
        />
        <textarea
          class="review-content-input"
          rows="4"
          placeholder="Cảm nhận của bạn về sản phẩm"
          :value="reviewForm.content"
          :disabled="!reviewEligibility.purchased || reviewSubmitting"
          @input="updateReviewField('content', $event.target.value)"
        ></textarea>
        <div class="review-form-actions">
          <p v-if="reviewSubmitError" class="review-submit-msg error">{{ reviewSubmitError }}</p>
          <p v-else-if="reviewSubmitSuccess" class="review-submit-msg success">{{ reviewSubmitSuccess }}</p>
          <span v-else></span>
          <button type="submit" class="review-submit-btn" :disabled="!reviewCanSubmit">
            {{ reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá' }}
          </button>
        </div>
      </form>
      <div v-for="item in product.reviews || []" :key="item.id" class="review-card">
        <div class="review-head">
          <img v-if="item.avatar" :src="item.avatar" alt="Avatar" class="avatar-img" />
          <span v-else class="avatar">U</span>
          <div>
            <p class="name">{{ item.user }}</p>
            <p class="date">{{ item.createdAt }}</p>
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
        <p class="text">{{ item.comment }}</p>
        <div v-if="item.images?.length" class="review-images">
          <span v-for="img in item.images" :key="`${item.id}-${img}`" class="review-image">{{ img }}</span>
        </div>
      </div>
    </div>
    <div v-else class="content muted">Nội dung tab đang được chuẩn hóa theo mẫu.</div>
  </section>
</template>
