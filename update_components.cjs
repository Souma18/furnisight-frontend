const fs = require('fs');

function updateOrderCard() {
  const file = 'src/features/account/components/orders/OrderCard.vue';
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/<span class="status-badge" :class="statusClass">/g, '<AppBadge :variant="statusClass">');
  content = content.replace(/<\/span> <!-- status badge -->/g, '</AppBadge> <!-- status badge -->');
  
  // Inject import
  if (!content.includes('AppBadge')) {
    content = content.replace(/import AppButton from '@shared\/ui\/AppButton\.vue'/, "import AppButton from '@shared/ui/AppButton.vue'\nimport AppBadge from '@shared/ui/AppBadge.vue'");
  }
  
  fs.writeFileSync(file, content);
  console.log('Updated OrderCard.vue');
}

function updateCartPage() {
  const file = 'src/features/cart/pages/CartPage.vue';
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace empty state
  const emptyHtml = `<div v-else class="cart-empty">
            <AppIcon name="shopping-cart" :size="48" class="empty-icon" />
            <h3>Giỏ hàng của bạn đang trống</h3>
            <p>Hãy thêm vài sản phẩm để bắt đầu mua sắm nhé.</p>
            <AppButton type="button" variant="primary" class="go-shop-btn" @click="router.push('/products')">Mua sắm ngay</AppButton>
          </div>`;
          
  const newEmpty = `<AppEmptyState v-else icon="shopping-cart" title="Giỏ hàng của bạn đang trống" description="Hãy thêm vài sản phẩm để bắt đầu mua sắm nhé." action-text="Mua sắm ngay" @action="router.push('/products')" class="cart-empty" />`;
  
  content = content.replace(emptyHtml, newEmpty);
  if (!content.includes('AppEmptyState')) {
    content = content.replace(/import AppButton from '@shared\/ui\/AppButton\.vue'/, "import AppButton from '@shared/ui/AppButton.vue'\nimport AppEmptyState from '@shared/ui/AppEmptyState.vue'");
  }
  fs.writeFileSync(file, content);
  console.log('Updated CartPage.vue');
}

updateOrderCard();
updateCartPage();
