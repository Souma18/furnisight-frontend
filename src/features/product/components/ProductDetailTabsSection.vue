<script setup>
import { computed } from 'vue'

const emit = defineEmits(['switch-tab'])
const props = defineProps({
  product: { type: Object, required: true },
  activeTab: { type: String, required: true },
})

const reviewCountLabel = computed(() => props.product?.rating?.count ?? 0)
const qaCountLabel = computed(() => props.product?.qa?.length ?? 0)
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
        <h2>{{ product.descriptionTitle }}</h2>
        <p v-for="text in product.description" :key="text">{{ text }}</p>
        <ul>
          <li v-for="item in product.features" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div class="spec-table">
        <div class="spec-head">{{ product.specs?.summaryTitle || 'Thông số cơ bản' }}</div>
        <div v-for="row in product.specs?.summaryRows || []" :key="`sum-desc-${row.key}`" class="spec-row">
          <div class="spec-key">{{ row.key }}</div>
          <div class="spec-val">{{ row.value }}</div>
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'spec'" class="pd-spec">
      <div class="spec-table">
        <div class="spec-head">{{ product.specs?.detailTitle || 'Chi tiết kỹ thuật đầy đủ' }}</div>
        <div v-for="row in product.specs?.detailRows || []" :key="`det-${row.key}`" class="spec-row">
          <div class="spec-key">{{ row.key }}</div>
          <div class="spec-val">{{ row.value }}</div>
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'review'" class="pd-review">
      <div class="review-summary">
        <div class="review-score">
          <p class="score">{{ product.rating?.score || '0.0' }}</p>
          <p class="stars">{{ product.rating?.stars || '☆☆☆☆☆' }}</p>
          <p class="count">{{ reviewCountLabel }} đánh giá</p>
        </div>
        <div class="review-bars">
          <div v-for="bar in product.reviews?.bars || []" :key="`bar-${bar.star}`" class="bar-row">
            <span class="bar-label">{{ bar.star }}★</span>
            <span class="bar-track"><span class="bar-fill" :style="{ width: `${bar.percent}%` }"></span></span>
            <span class="bar-count">{{ bar.count }}</span>
          </div>
        </div>
      </div>
      <div v-for="item in product.reviews?.items || []" :key="item.id" class="review-card">
        <div class="review-head">
          <span class="avatar">{{ item.avatar }}</span>
          <div>
            <p class="name">{{ item.name }}</p>
            <p class="date">{{ item.date }}</p>
          </div>
          <span class="stars">{{ item.stars }}</span>
        </div>
        <p class="text">{{ item.text }}</p>
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
