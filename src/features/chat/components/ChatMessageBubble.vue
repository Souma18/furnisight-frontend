<script setup>
import { computed } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import ChatProductCard from './ChatProductCard.vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  timeLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['add-to-cart'])

const isUser = computed(() => props.message.role === 'user')
</script>

<template>
  <div class="chat-msg" :class="{ user: isUser }">
    <div class="msg-avatar" :class="{ bot: !isUser, user: isUser }">
      <AppIcon v-if="!isUser" name="bot" :size="14" />
      <span v-else>NA</span>
    </div>

    <div class="chat-msg-body">
      <div class="bubble" :class="isUser ? 'user' : 'bot'">
        <template v-if="isUser">{{ message.content }}</template>
        <div v-else v-html="message.content" />
        <span class="bubble-time">{{ timeLabel }}</span>
      </div>

      <div v-if="message.products?.length" class="chat-product-row">
        <ChatProductCard
          v-for="product in message.products"
          :key="product.id"
          :product="product"
          @add-to-cart="emit('add-to-cart', $event)"
        />
      </div>
    </div>
  </div>
</template>
