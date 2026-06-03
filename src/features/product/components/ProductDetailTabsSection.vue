<script setup>
import { toRef } from 'vue'
import { useProductTabs } from '../composables/useProductTabs'

const emit = defineEmits(['switch-tab'])
const props = defineProps({
  product: { type: Object, required: true },
  activeTab: { type: String, required: true },
})

const {
  reviewCountLabel,
  qaCountLabel,
  specsRows,
  reviewBars,
  getStars,
} = useProductTabs(toRef(props, 'product'))
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
      <button type="button" :class="{ active: activeTab === 'qa' }" @click="emit('switch-tab', 'qa')">
        Hỏi & Đáp ({{ qaCountLabel }})
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
          <p class="stars">{{ getStars(product.rating) }}</p>
          <p class="count">{{ reviewCountLabel }} đánh giá</p>
        </div>
        <div class="review-bars">
          <div v-for="bar in reviewBars" :key="`bar-${bar.star}`" class="bar-row">
            <span class="bar-label">{{ bar.star }}★</span>
            <span class="bar-track"><span class="bar-fill" :style="{ width: `${bar.percent}%` }"></span></span>
            <span class="bar-count">{{ bar.count }}</span>
          </div>
        </div>
      </div>
      <div v-for="item in product.reviews || []" :key="item.id" class="review-card">
        <div class="review-head">
          <img v-if="item.avatar" :src="item.avatar" alt="Avatar" class="avatar-img" />
          <span v-else class="avatar">U</span>
          <div>
            <p class="name">{{ item.user }}</p>
            <p class="date">{{ item.createdAt }}</p>
          </div>
          <span class="stars">{{ getStars(item.rating) }}</span>
        </div>
        <p class="text">{{ item.comment }}</p>
        <div v-if="item.images?.length" class="review-images">
          <span v-for="img in item.images" :key="`${item.id}-${img}`" class="review-image">{{ img }}</span>
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'qa'" class="pd-qa">
      <div v-for="item in product.qa || []" :key="item.id" class="qa-card">
        <p class="question">❓ {{ item.question }}</p>
        <p class="answer"><strong>LUXNEST:</strong> {{ item.answer }}</p>
      </div>
    </div>
    <div v-else class="content muted">Nội dung tab đang được chuẩn hóa theo mẫu.</div>
  </section>
</template>
