<script setup>
import { computed, ref } from 'vue'
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { adminApi, productsApi } from '@shared/lib/api/services'
import { PriceFormatter } from '@shared/lib/formatters'
import AdminChartCard from '../../components/shared/AdminChartCard.vue'
import AdminKpiGrid from '../../components/shared/AdminKpiGrid.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import { useAdminChartPage } from '../../composables/useAdminChartPage'
import { useAdminUiStore } from '../../store/adminUiStore'

const ui = useAdminUiStore()
const userCanvas = ref(null)
const catCanvas = ref(null)
const reviewCanvas = ref(null)
const { data, bindCharts } = useAdminChartPage(adminApi.fetchStats.bind(adminApi))

const formatCurrency = PriceFormatter.format
const formatPercent = (value) => `${Math.round(Number(value || 0) * 1000) / 10}%`

const kpis = computed(() => {
  const user = data.value?.user || {}
  const orders = data.value?.orders || {}
  const products = data.value?.products || {}

  return [
    {
      key: 'users',
      label: 'Người dùng',
      value: String(user.total || 0),
      change: `${user.newThisMonth || 0} mới tháng này`,
      up: true,
      tone: 'blue',
      icon: 'users',
    },
    {
      key: 'orders',
      label: 'Đơn hàng',
      value: String(orders.total || 0),
      change: `${orders.today || 0} hôm nay`,
      up: true,
      tone: 'red',
      icon: 'box',
    },
    {
      key: 'revenue',
      label: 'Doanh thu',
      value: formatCurrency(orders.totalRevenue),
      change: `${formatCurrency(orders.revenueThisMonth)} tháng này`,
      up: true,
      tone: 'gold',
      icon: 'trendingUp',
    },
    {
      key: 'products',
      label: 'Sản phẩm',
      value: String(products.total || 0),
      change: `${products.lowStock || 0} sắp hết`,
      up: Number(products.lowStock || 0) === 0,
      tone: 'green',
      icon: 'armchair',
    },
  ]
})

const reviewKpis = computed(() => {
  const reviews = data.value?.reviews || {}
  const totalReviews = Number(reviews.totalReviews || 0)
  const analyzedReviews = Number(reviews.analyzedReviews || 0)
  const positiveCount = Number(reviews.positiveCount || 0)
  const neutralCount = Number(reviews.neutralCount || 0)
  const negativeCount = Number(reviews.negativeCount || 0)
  const failedReviews = Number(reviews.failedReviews || 0)

  return [
    {
      key: 'review-total',
      label: 'Tổng đánh giá',
      value: String(totalReviews),
      change: `${analyzedReviews} đã phân tích`,
      up: true,
      tone: 'blue',
      icon: 'messageSquare',
    },
    {
      key: 'review-positive',
      label: 'Tích cực',
      value: String(positiveCount),
      change: totalReviews ? formatPercent(positiveCount / totalReviews) : '0%',
      up: true,
      tone: 'green',
      icon: 'thumbsUp',
    },
    {
      key: 'review-neutral',
      label: 'Trung lập',
      value: String(neutralCount),
      change: totalReviews ? formatPercent(neutralCount / totalReviews) : '0%',
      up: true,
      tone: 'gold',
      icon: 'minus',
    },
    {
      key: 'review-negative',
      label: 'Tiêu cực',
      value: String(negativeCount),
      change: failedReviews ? `${failedReviews} lỗi phân tích` : (totalReviews ? formatPercent(negativeCount / totalReviews) : '0%'),
      up: false,
      tone: 'red',
      icon: 'alertTriangle',
    },
  ]
})

const reviewHealth = computed(() => {
  const reviews = data.value?.reviews || {}
  const totalReviews = Number(reviews.totalReviews || 0)
  const analyzedReviews = Number(reviews.analyzedReviews || 0)
  const pendingReviews = Number(reviews.pendingReviews || 0)
  const failedReviews = Number(reviews.failedReviews || 0)

  return [
    { label: 'Đã phân tích', value: analyzedReviews },
    { label: 'Chờ xử lý', value: pendingReviews },
    { label: 'Lỗi', value: failedReviews },
    { label: 'Tỷ lệ đã phân tích', value: totalReviews ? formatPercent(analyzedReviews / totalReviews) : '0%' },
  ]
})

const topNegativeProducts = computed(() => {
  const items = Array.isArray(data.value?.reviews?.topNegativeProducts)
    ? data.value.reviews.topNegativeProducts
    : []
  return items.slice(0, 5)
})

bindCharts((charts, payload) => {
  const user = payload.user || {}
  const categories = Array.isArray(payload.topCategories) ? payload.topCategories : []
  const reviews = payload.reviews || {}

  charts.renderBar(
    userCanvas.value,
    ['Tổng', 'Hoạt động', 'Bị khóa', 'Mới tháng'],
    [user.total || 0, user.active || 0, user.banned || 0, user.newThisMonth || 0],
  )

  charts.renderDoughnut(
    catCanvas.value,
    categories.map((category) => category.name),
    categories.map((category) => category.productCount || 0),
  )

  charts.renderDoughnut(
    reviewCanvas.value,
    ['Tích cực', 'Trung lập', 'Tiêu cực'],
    [
      reviews.positiveCount || 0,
      reviews.neutralCount || 0,
      reviews.negativeCount || 0,
    ],
    ['#2a7a50', '#c9922a', '#c0392b'],
  )
})

// Review Modal Logic
const isReviewModalOpen = ref(false)
const selectedProduct = ref(null)
const productReviews = ref([])
const isLoadingReviews = ref(false)
const sentimentFilter = ref('NEGATIVE')

async function openReviewModal(product) {
  selectedProduct.value = product
  isReviewModalOpen.value = true
  sentimentFilter.value = 'NEGATIVE'
  await fetchProductReviews()
}

function closeReviewModal() {
  isReviewModalOpen.value = false
  selectedProduct.value = null
  productReviews.value = []
}

async function fetchProductReviews() {
  if (!selectedProduct.value) return
  isLoadingReviews.value = true
  try {
    const params = { page: 0, size: 50 }
    if (sentimentFilter.value) {
      params.sentiment = sentimentFilter.value
    }
    const response = await productsApi.getReviews(selectedProduct.value.productId, params)
    productReviews.value = response.data?.content || []
  } catch (error) {
    ui.showToast({ icon: 'alertTriangle', title: 'Lỗi', subtitle: 'Không thể tải đánh giá' })
  } finally {
    isLoadingReviews.value = false
  }
}

function getSentimentLabel(sentiment) {
  switch(sentiment) {
    case 'POSITIVE': return 'Tích cực'
    case 'NEGATIVE': return 'Tiêu cực'
    case 'NEUTRAL': return 'Trung lập'
    default: return sentiment || 'Chưa phân tích'
  }
}
function getSentimentBadgeClass(sentiment) {
  switch(sentiment) {
    case 'POSITIVE': return 'b-success'
    case 'NEGATIVE': return 'b-cancel'
    case 'NEUTRAL': return 'b-gold'
    default: return 'b-navy'
  }
}

</script>

<template>
  <AdminPageHeader
    eyebrow="Phân tích"
    title-html="Thống kê <em>& Báo cáo</em>"
    subtitle="Tổng hợp dữ liệu kinh doanh"
  >
    <template #actions>
      <AppButton
        variant="unstyled"
        type="button"
        class="btn-export"
        @click="ui.showToast({ icon: 'download', title: 'Xuất báo cáo', subtitle: 'Đang tạo file PDF...' })"
      >
        <AppIcon name="download" :size="15" />
        Xuất PDF
      </AppButton>
    </template>
  </AdminPageHeader>

  <template v-if="data">
    <AdminKpiGrid :kpis="kpis" />

    <div class="stats-grid">
      <AdminChartCard title="Người dùng mới theo tháng" subtitle="2026">
        <canvas ref="userCanvas" />
      </AdminChartCard>

      <AdminChartCard title="Top danh mục bán chạy" subtitle="Theo doanh thu">
        <canvas ref="catCanvas" />
      </AdminChartCard>
    </div>

    <section class="review-section">
      <div class="review-section-head">
        <div>
          <h2 class="review-section-title">Phân tích đánh giá</h2>
          <p class="review-section-sub">
            Theo dõi chất lượng phản hồi và các sản phẩm đang có tín hiệu tiêu cực.
          </p>
        </div>
      </div>

      <AdminKpiGrid :kpis="reviewKpis" compact />

      <div class="review-grid">
        <AdminChartCard title="Phân bố cảm xúc" subtitle="PhoBERT sentiment">
          <canvas ref="reviewCanvas" />
        </AdminChartCard>

        <AdminChartCard title="Trạng thái xử lý" subtitle="Review sentiment pipeline" flexible>
          <div class="review-health">
            <div v-for="item in reviewHealth" :key="item.label" class="review-health-item">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </AdminChartCard>
      </div>

      <AdminChartCard
        title="Sản phẩm bị đánh giá tiêu cực nhiều nhất"
        subtitle="Ưu tiên kiểm tra chất lượng và dịch vụ liên quan"
      >
        <div v-if="topNegativeProducts.length" class="negative-list">
          <article v-for="product in topNegativeProducts" :key="product.productId" class="negative-item">
            <div class="negative-main">
              <strong>{{ product.productName || product.productId }}</strong>
              <span>{{ product.negativeCount }} đánh giá tiêu cực</span>
            </div>

            <div class="negative-metrics">
              <span>Tỷ lệ: {{ formatPercent(product.negativeRatio) }}</span>
              <span>Hiển thị: {{ product.visibleReviewCount }}</span>
              <span>Điểm TB: {{ Number(product.averageRating || 0).toFixed(1) }}</span>
              <button class="tcard-action" style="margin-left: auto;" @click="openReviewModal(product)">
                <AppIcon name="eye" /> Xem đánh giá
              </button>
            </div>
          </article>
        </div>

        <div v-else class="negative-empty">
          Chưa có sản phẩm nào xuất hiện cụm đánh giá tiêu cực đáng chú ý.
        </div>
      </AdminChartCard>
    </section>

    <!-- Review Modal -->
    <Teleport to="body">
      <div class="modal-overlay" :class="{ open: isReviewModalOpen }" @click.self="closeReviewModal">
        <div class="modal-box modal-box--wide">
          <div class="modal-head">
            <h3 class="modal-title">Đánh giá <em>{{ selectedProduct?.productName || selectedProduct?.productId }}</em></h3>
            <button class="modal-close" @click="closeReviewModal"><AppIcon name="x" /></button>
          </div>
          <div class="modal-body">
            <div class="filter-bar">
              <select class="filter-select" v-model="sentimentFilter" @change="fetchProductReviews">
                <option value="">Tất cả cảm xúc</option>
                <option value="POSITIVE">Tích cực</option>
                <option value="NEUTRAL">Trung lập</option>
                <option value="NEGATIVE">Tiêu cực</option>
              </select>
            </div>
            
            <div v-if="isLoadingReviews" style="padding: 20px; text-align: center; color: var(--text3);">
              Đang tải đánh giá...
            </div>
            <div v-else-if="productReviews.length === 0" style="padding: 20px; text-align: center; color: var(--text3);">
              Không có đánh giá nào phù hợp.
            </div>
            <div v-else class="review-dialog-list">
              <div v-for="rev in productReviews" :key="rev.id" class="review-dialog-item">
                <div class="rdi-head">
                  <div class="flex-cell">
                    <img v-if="rev.userAvatarUrl" :src="rev.userAvatarUrl" class="av" />
                    <div v-else class="av av-gold">{{ rev.userName?.charAt(0) || 'U' }}</div>
                    <div>
                      <div class="cell-name">{{ rev.userName }}</div>
                      <div class="cell-sub">{{ new Date(rev.createdAt).toLocaleString() }} - {{ rev.rating }} sao</div>
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
    </Teleport>

  </template>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 4px;
}

.review-section {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.review-section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
}

.review-section-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #12202e;
}

.review-section-sub {
  margin: 0.25rem 0 0;
  font-size: 0.84rem;
  color: #667085;
}

.review-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  gap: 14px;
}

.review-health {
  display: grid;
  gap: 10px;
}

.review-health-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e6e8ec;
  border-radius: 8px;
  background: #fffdfa;
  font-size: 0.84rem;
  color: #475467;
}

.review-health-item strong {
  color: #12202e;
  font-size: 0.95rem;
}

.negative-list {
  display: grid;
  gap: 10px;
}

.negative-item {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid #ece5d8;
  border-radius: 8px;
  background: #fffdfa;
}

.negative-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.negative-main strong {
  color: #12202e;
  font-size: 0.9rem;
}

.negative-main span,
.negative-metrics span,
.negative-empty {
  color: #667085;
  font-size: 0.8rem;
}

.negative-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
}

.negative-empty {
  padding: 8px 2px;
}

@media (max-width: 980px) {
  .stats-grid,
  .review-grid {
    grid-template-columns: 1fr;
  }

  .negative-main {
    flex-direction: column;
    align-items: flex-start;
  }
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
