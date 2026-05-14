<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useCartStore } from '../store/cartStore'
import { formatVnd } from '@features/product/mock/productListMockData'

const store = useCartStore()
const { lines } = storeToRefs(store)

const totalAmount = computed(() =>
  lines.value.reduce((total, line) => total + (Number(line.price) || 0) * (Number(line.qty) || 0), 0),
)

function changeQty(line, delta) {
  store.updateLineQty(line.id, (Number(line.qty) || 1) + delta)
}

function handleVariantChange(line, field, event) {
  store.updateLineVariant(line.id, field, event.target.value)
}
</script>

<template>
  <section class="cart-page">
    <header class="cart-hero">
      <div>
        <p class="cart-kicker">Giỏ hàng của tôi</p>
        <h1>Danh sách sản phẩm đã chọn</h1>
        <p class="cart-subtitle">
          Chọn lại phân loại ngay trong giỏ, cập nhật số lượng và xóa nhanh những món không cần.
        </p>
      </div>
      <div class="cart-summary-pill">
        <span>Tổng cộng</span>
        <strong>{{ formatVnd(totalAmount) }}</strong>
      </div>
    </header>

    <div v-if="!lines.length" class="cart-empty">
      <AppIcon name="cart" :size="20" />
      <p>Giỏ hàng đang trống.</p>
    </div>

    <div v-else class="cart-shell">
      <div class="cart-table-head">
        <span>Sản phẩm</span>
        <span>Phân loại hàng</span>
        <span>Đơn giá</span>
        <span>Số lượng</span>
        <span>Thành tiền</span>
        <span></span>
      </div>

      <article v-for="line in lines" :key="line.id" class="cart-row">
        <label class="cart-check">
          <input type="checkbox" />
        </label>

        <div class="cart-thumb">
          <div class="cart-thumb-fallback">{{ line.imageFallback }}</div>
        </div>

        <div class="cart-info">
          <p class="cart-category">{{ line.category }}</p>
          <h2>{{ line.name }}</h2>
          <p class="cart-meta">Có thể đổi màu và kích thước trực tiếp ở đây.</p>
        </div>

        <div class="cart-variants">
          <label>
            <span>Màu</span>
            <select :value="line.selectedColor" @change="handleVariantChange(line, 'selectedColor', $event)">
              <option v-for="color in line.colors" :key="color" :value="color">{{ color }}</option>
            </select>
          </label>
          <label>
            <span>Kích thước</span>
            <select :value="line.selectedSize" @change="handleVariantChange(line, 'selectedSize', $event)">
              <option v-for="size in line.sizes" :key="size" :value="size">{{ size }}</option>
            </select>
          </label>
        </div>

        <div class="cart-price">
          <strong>{{ formatVnd(line.price) }}</strong>
          <span v-if="line.oldPrice">{{ formatVnd(line.oldPrice) }}</span>
        </div>

        <div class="cart-qty">
          <button type="button" @click="changeQty(line, -1)">−</button>
          <input :value="line.qty" readonly />
          <button type="button" @click="changeQty(line, 1)">+</button>
        </div>

        <div class="cart-total">
          <strong>{{ formatVnd((Number(line.price) || 0) * (Number(line.qty) || 0)) }}</strong>
        </div>

        <div class="cart-actions">
          <button type="button" class="delete-btn" @click="store.removeLine(line.id)">
            Xóa
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.cart-page {
  background: #faf6f0;
  color: #1a1a1a;
  padding: 32px 0 56px;
}

.cart-hero,
.cart-shell {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 60px;
}

.cart-hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
}

.cart-kicker {
  margin: 0 0 10px;
  color: #c9922a;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 700;
}

.cart-hero h1 {
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 42px;
  font-weight: 300;
  line-height: 1.1;
}

.cart-subtitle {
  margin: 10px 0 0;
  max-width: 680px;
  color: #6b7280;
  line-height: 1.7;
}

.cart-summary-pill {
  min-width: 220px;
  padding: 16px 20px;
  border-radius: 18px;
  background: #12202e;
  color: #fff;
  display: grid;
  gap: 6px;
  box-shadow: 0 16px 36px rgba(18, 32, 46, 0.16);
}

.cart-summary-pill span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.cart-summary-pill strong {
  font-size: 24px;
  color: #e5b84a;
}

.cart-empty {
  max-width: 1300px;
  margin: 0 auto;
  padding: 28px 60px;
  background: #fff;
  border: 1px solid #ece2cf;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #6b7280;
}

.cart-shell {
  display: grid;
  gap: 14px;
}

.cart-table-head,
.cart-row {
  display: grid;
  grid-template-columns: 28px 120px minmax(220px, 1.5fr) minmax(220px, 1fr) 120px 120px 130px 88px;
  gap: 16px;
  align-items: center;
}

.cart-table-head {
  padding: 0 8px 8px;
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.cart-row {
  background: #fff;
  border: 1px solid #ece2cf;
  border-radius: 20px;
  padding: 16px 18px;
  box-shadow: 0 10px 28px rgba(18, 32, 46, 0.05);
}

.cart-check input {
  width: 18px;
  height: 18px;
  accent-color: #c9922a;
}

.cart-thumb {
  width: 120px;
  height: 96px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #f0e9dd, #faf6f0);
  border: 1px solid #f0e9dd;
}

.cart-thumb-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 56px;
}

.cart-info h2 {
  margin: 4px 0 0;
  font-size: 17px;
  line-height: 1.35;
}

.cart-category {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c9922a;
  font-weight: 700;
}

.cart-meta {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.cart-variants {
  display: grid;
  gap: 10px;
}

.cart-variants label {
  display: grid;
  gap: 6px;
}

.cart-variants span {
  font-size: 12px;
  color: #6b7280;
}

.cart-variants select {
  appearance: none;
  border: 1px solid #ece2cf;
  border-radius: 12px;
  padding: 10px 38px 10px 12px;
  background: #fff;
  color: #1a1a1a;
  font: inherit;
  background-image: linear-gradient(45deg, transparent 50%, #9ca3af 50%), linear-gradient(135deg, #9ca3af 50%, transparent 50%);
  background-position: calc(100% - 18px) calc(50% - 2px), calc(100% - 12px) calc(50% - 2px);
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
}

.cart-price,
.cart-total {
  text-align: right;
}

.cart-price strong,
.cart-total strong {
  display: block;
  font-size: 16px;
  color: #12202e;
}

.cart-price span {
  display: inline-block;
  margin-top: 4px;
  color: #9ca3af;
  text-decoration: line-through;
  font-size: 12px;
}

.cart-qty {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ece2cf;
  border-radius: 12px;
  overflow: hidden;
}

.cart-qty button {
  width: 36px;
  height: 36px;
  border: none;
  background: #f0e9dd;
  color: #12202e;
  font-size: 18px;
  cursor: pointer;
}

.cart-qty input {
  width: 44px;
  height: 36px;
  border: none;
  border-inline: 1px solid #ece2cf;
  text-align: center;
  background: #fff;
  color: #1a1a1a;
}

.cart-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-btn {
  border: none;
  background: transparent;
  color: #c9922a;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
}

.delete-btn:hover {
  color: #0c3148;
}

@media (max-width: 1100px) {
  .cart-hero,
  .cart-shell {
    padding: 0 24px;
  }

  .cart-table-head {
    display: none;
  }

  .cart-row {
    grid-template-columns: 28px 96px minmax(0, 1fr);
    grid-template-areas:
      'check thumb info'
      'variants variants variants'
      'price qty total'
      'action action action';
    align-items: start;
  }

  .cart-check { grid-area: check; }
  .cart-thumb { grid-area: thumb; width: 96px; height: 86px; }
  .cart-info { grid-area: info; }
  .cart-variants { grid-area: variants; }
  .cart-price { grid-area: price; text-align: left; }
  .cart-qty { grid-area: qty; }
  .cart-total { grid-area: total; text-align: left; }
  .cart-actions { grid-area: action; justify-content: flex-start; }
}

@media (max-width: 720px) {
  .cart-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .cart-hero h1 {
    font-size: 32px;
  }

  .cart-row {
    grid-template-columns: 28px minmax(0, 1fr);
    grid-template-areas:
      'check thumb'
      'info info'
      'variants variants'
      'price qty'
      'total action';
  }

  .cart-thumb { width: 100%; height: 96px; }
}
</style>
