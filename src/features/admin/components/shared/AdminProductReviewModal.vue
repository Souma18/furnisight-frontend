<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  isOpen: { type: Boolean, default: false },
  selectedProduct: { type: Object, default: null },
  reviews: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  sentimentFilter: { type: String, default: 'NEGATIVE' },
})

const emit = defineEmits(['close', 'update:sentimentFilter'])

function getSentimentLabel(sentiment) {
  switch (sentiment) {
    case 'POSITIVE': return 'Tích cực'
    case 'NEGATIVE': return 'Tiêu cực'
    case 'NEUTRAL': return 'Trung lập'
    default: return sentiment || 'Chưa phân tích'
  }
}

function getSentimentBadgeClass(sentiment) {
  switch (sentiment) {
    case 'POSITIVE': return 'b-success'
    case 'NEGATIVE': return 'b-cancel'
    case 'NEUTRAL': return 'b-gold'
    default: return 'b-navy'
  }
}
</script>

<template>
  <div class="modal-overlay" :class="{ open: isOpen }" @click.self="emit('close')">
      <div class="modal-box modal-box--wide admin-vars">
        <div class="modal-head">
          <h3 class="modal-title">Đánh giá <em>{{ selectedProduct?.productName || selectedProduct?.productId }}</em></h3>
          <button class="modal-close" @click="emit('close')"><AppIcon name="x" /></button>
        </div>
        <div class="modal-body">
          <div class="filter-bar">
            <select
              class="filter-select"
              :value="sentimentFilter"
              @change="emit('update:sentimentFilter', $event.target.value)"
            >
              <option value="">Tất cả cảm xúc</option>
              <option value="POSITIVE">Tích cực</option>
              <option value="NEUTRAL">Trung lập</option>
              <option value="NEGATIVE">Tiêu cực</option>
            </select>
          </div>

          <div v-if="loading" class="state-msg">Đang tải đánh giá...</div>
          <div v-else-if="reviews.length === 0" class="state-msg">Không có đánh giá nào phù hợp.</div>
          <div v-else class="review-dialog-list">
            <div v-for="rev in reviews" :key="rev.id" class="review-dialog-item">
              <div class="rdi-head">
                <div class="flex-cell">
                  <img v-if="rev.userAvatarUrl" :src="rev.userAvatarUrl" class="av" />
                  <div v-else class="av av-gold">{{ rev.userName?.charAt(0) || 'U' }}</div>
                  <div>
                    <div class="cell-name">{{ rev.userName }}</div>
                    <div class="cell-sub">{{ new Date(rev.createdAt).toLocaleString() }} · {{ rev.rating }} sao</div>
                  </div>
                </div>
                <div class="badge" :class="getSentimentBadgeClass(rev.sentiment)">{{ getSentimentLabel(rev.sentiment) }}</div>
              </div>
              <div class="rdi-title">{{ rev.title }}</div>
              <div class="rdi-content">{{ rev.content }}</div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<style scoped>
.state-msg {
  padding: 20px;
  text-align: center;
  color: var(--text3);
}
.review-dialog-list {
  display: grid;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}
.review-dialog-item {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--cream);
}
.rdi-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}
.rdi-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--text);
  margin-bottom: 4px;
}
.rdi-content {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.5;
}
</style>
