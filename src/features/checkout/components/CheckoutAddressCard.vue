<script setup>
import { computed } from 'vue'
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { formatVietnamAddress } from '@shared/lib/formatters'

const props = defineProps({
  addresses: {
    type: Array,
    default: () => [],
  },
  selectedAddressId: {
    type: [String, Number],
    default: '',
  },
})

defineEmits(['select-address', 'open-create', 'open-edit'])

const selectedAddress = computed(
  () => props.addresses.find((item) => String(item.id) === String(props.selectedAddressId)) ?? props.addresses[0] ?? null,
)
</script>

<template>
  <section class="checkout-card">
    <div class="checkout-card-head">
      <h2 class="checkout-card-title">
        <AppIcon name="mapPin" :size="16" />
        {{ $t('checkout.address.title') }}
      </h2>
      <AppButton variant="unstyled" type="button" class="checkout-card-change" @click="$emit('open-create')">{{ $t('checkout.address.add') }}</AppButton>
    </div>

    <div v-if="!addresses.length" class="co-empty">
      {{ $t('checkout.address.empty') }}
    </div>

    <div v-else class="co-address-list">
      <label
        v-for="address in addresses"
        :key="address.id"
        class="co-address-option"
        :class="{ 'co-address-option--active': String(address.id) === String(selectedAddress?.id) }"
      >
        <input
          type="radio"
          name="checkout-address"
          :checked="String(address.id) === String(selectedAddress?.id)"
          @change="$emit('select-address', address.id)"
        />
        <div class="co-addr-avatar">{{ address.fullName?.slice(0, 2)?.toUpperCase() ?? 'NA' }}</div>
        <div class="co-address-main">
          <div class="co-addr-name">
            {{ address.fullName }} ({{ address.phone }})
            <span v-if="address.isDefault" class="co-addr-default">{{ $t('checkout.address.default') }}</span>
          </div>
          <p class="co-addr-street">{{ formatVietnamAddress(address) }}</p>
        </div>
        <AppButton variant="unstyled" type="button" class="co-address-edit" @click.prevent="$emit('open-edit', address)">{{ $t('checkout.address.edit') }}</AppButton>
      </label>
    </div>
  </section>
</template>
