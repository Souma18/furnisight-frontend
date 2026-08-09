<script setup>
import AppButton from "@shared/ui/AppButton.vue";
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@features/auth/store/authStore";
import { openAuthModal } from "@features/auth/lib/authModalBus";
import AppIcon from "@shared/ui/AppIcon.vue";
import CartItemCard from "../components/CartItemCard.vue";
import CartSummaryBar from "../components/CartSummaryBar.vue";
import CartVariantModal from "../components/CartVariantModal.vue";
import { useCartPage } from "../composables/useCartPage";

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

const {
  items,
  loading,
  hydrated,
  checkedIds,
  availableItemIds,
  allAvailableChecked,
  partiallyChecked,
  selectedItems,
  selectedCount,
  total,
  toggleChecked,
  toggleAllChecked,
  activeItem,
  activeDraft,
  editorLoading,
  openItemEditor,
  closeItemEditor,
  applyActiveItemChanges,
  changeDraftQty,
  setDraftQty,
  handleCheckout,
  changeQty,
  removeLine,
  formatPrice,
  getVariantOptions,
} = useCartPage();
</script>

<template>
  <div class="cart-page">
    <div class="cart-container">
      <div class="cart-back-link">
        <RouterLink to="/products">
          <AppIcon name="chevronLeft" :size="14" />
          Tiếp tục mua sắm
        </RouterLink>
      </div>
      <div class="cart-header">
        <h1 class="page-title">Giỏ hàng của bạn</h1>
        <p class="page-subtitle" v-if="items.length">
          {{ items.length }} sản phẩm trong giỏ hàng
        </p>
      </div>

      <!-- Loading / Hydrating state -->
      <div v-if="loading && !hydrated" class="cart-loading">
        <div class="cart-loading-spinner"></div>
        <p>Đang tải giỏ hàng của bạn...</p>
      </div>

      <!-- Authenticated & Has Items -->
      <div class="cart-content" v-else-if="items.length">
        <div class="select-all-row">
          <label class="select-all-box">
            <input
              type="checkbox"
              :checked="allAvailableChecked"
              :indeterminate="partiallyChecked"
              :disabled="!availableItemIds.length"
              @change="toggleAllChecked"
            />
            <span>Chọn tất cả</span>
          </label>
          <span
            >{{ selectedCount }} / {{ availableItemIds.length }} sản phẩm</span
          >
        </div>

        <div class="list">
          <CartItemCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            :checked="checkedIds.includes(item.id)"
            @toggle-check="toggleChecked"
            @open-variant="openItemEditor"
            @change-qty="changeQty"
            @remove="removeLine"
          />
        </div>

        <div class="cart-summary">
          <CartSummaryBar
            :selected-count="selectedCount"
            :total-label="formatPrice(total)"
            :checkout-disabled="!selectedCount"
            @checkout="handleCheckout"
          />
        </div>
      </div>

      <!-- Not Authenticated & Empty Cart -->
      <div class="cart-empty" v-else-if="!isAuthenticated">
        <div class="cart-empty-icon">🔐</div>
        <h2>Đăng nhập để xem giỏ hàng</h2>
        <p>
          Vui lòng đăng nhập để lưu trữ và xem các sản phẩm trong giỏ hàng của
          bạn.
        </p>
        <AppButton class="primary-btn continue-shopping" @click="openAuthModal"
          >Đăng nhập ngay</AppButton
        >
      </div>

      <!-- Authenticated & Empty Cart -->
      <div class="cart-empty" v-else>
        <div class="cart-empty-icon">🛒</div>
        <h2>Giỏ hàng trống</h2>
        <p>Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <AppButton
          class="primary-btn continue-shopping"
          @click="router.push('/products')"
          >Tiếp tục mua sắm</AppButton
        >
      </div>
    </div>

    <CartVariantModal
      v-if="activeItem && activeDraft"
      :active-item="activeItem"
      :active-draft="activeDraft"
      :loading="editorLoading"
      :get-variant-options="getVariantOptions"
      @close="closeItemEditor"
      @save="applyActiveItemChanges"
      @change-qty="changeDraftQty"
      @set-qty="setDraftQty"
    />
  </div>
</template>

<style scoped>
.cart-page {
  background: #faf6f0;
  min-height: calc(100vh - 80px);
  padding: 40px 20px;
  font-family: var(--sans);
  color: #1a1a1a;
}

.cart-container {
  max-width: 1000px;
  margin: 0 auto;
}

.cart-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  font-family: var(--sans);
  font-size: 42px;
  font-weight: 600;
  color: #12202e;
  margin: 0 0 10px;
}

.page-subtitle {
  color: #7a7a7a;
  font-size: 16px;
  margin: 0;
}

.cart-content {
  background: #fff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(18, 32, 46, 0.05);
  border: 1px solid #ece2cf;
}

.select-all-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #ece2cf;
  color: #7a7a7a;
  font-size: 14px;
}

.select-all-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #12202e;
  font-weight: 700;
  cursor: pointer;
}

.select-all-box input {
  width: 16px;
  height: 16px;
  accent-color: #c9922a;
}

.list {
  display: grid;
  gap: 1.25rem;
}

.cart-summary {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ece2cf;
}

.cart-empty {
  background: #fff;
  border-radius: 24px;
  padding: 36px 24px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(18, 32, 46, 0.05);
  border: 1px solid #ece2cf;
}

.cart-empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  color: #e5b84a;
}

.cart-empty h2 {
  font-size: 24px;
  margin: 0 0 10px;
  color: #12202e;
}

.cart-empty p {
  color: #7a7a7a;
  margin: 0 0 30px;
}

.continue-shopping {
  padding: 14px 32px;
  font-size: 16px;
}

.cart-loading {
  background: #fff;
  border-radius: 24px;
  padding: 36px 24px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(18, 32, 46, 0.05);
  border: 1px solid #ece2cf;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 250px;
}

.cart-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #ece2cf;
  border-top-color: #c9922a;
  border-radius: 50%;
  animation: cartSpin 0.8s linear infinite;
}

@keyframes cartSpin {
  to {
    transform: rotate(360deg);
  }
}

.cart-back-link {
  margin-bottom: 20px;
}

.cart-back-link a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #7a7a7a;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.cart-back-link a:hover {
  color: #c9922a;
}

@media (max-width: 720px) {
  .cart-content {
    padding: 15px;
  }
}
</style>
