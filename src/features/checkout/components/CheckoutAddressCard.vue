<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import { formatVietnamAddress } from '@shared/lib/formatters'

defineProps({
  address: {
    type: Object,
    default: null,
  },
})

defineEmits(['change-address'])
</script>

<template>
  <section class="checkout-card">
    <div class="checkout-card-head">
      <h2 class="checkout-card-title">
        <AppIcon name="mapPin" :size="16" />
        Địa chỉ giao hàng
      </h2>
      <button type="button" class="checkout-card-change" @click="$emit('change-address')">Thay đổi</button>
    </div>

    <div v-if="!address" class="co-empty">
      Chưa có địa chỉ mặc định. Vui lòng thêm địa chỉ trong tài khoản.
    </div>

    <div v-else class="co-addr-wrap">
      <div class="co-addr-row">
        <div class="co-addr-avatar">{{ address.fullName?.slice(0, 2)?.toUpperCase() ?? 'NA' }}</div>
        <div>
          <div class="co-addr-name">
            {{ address.fullName }} ({{ address.phone }})
            <span v-if="address.isDefault" class="co-addr-default">Mặc định</span>
          </div>
          <p class="co-addr-street">{{ formatVietnamAddress(address) }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
