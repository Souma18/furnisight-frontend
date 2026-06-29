<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { ref } from 'vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
})

const openIds = ref(props.items.filter((item) => item.open).map((item) => item.id))

function isOpen(id) {
  return openIds.value.includes(id)
}

function toggleFaq(id) {
  if (isOpen(id)) {
    openIds.value = openIds.value.filter((openId) => openId !== id)
    return
  }

  openIds.value = [...openIds.value, id]
}
</script>

<template>
  <section class="ct-faq-section ct-fade-up">
    <div class="ct-faq-title-wrap">
      <div class="ct-sec-label">{{ section.label }}</div>
      <h2 class="ct-sec-title">
        {{ section.titleLine1 }}
        <em>{{ section.titleAccent }}</em>
      </h2>
    </div>

    <div class="ct-faq-grid">
      <article
        v-for="item in items"
        :key="item.id"
        class="ct-faq-item"
        :class="{ open: isOpen(item.id) }"
      >
        <AppButton type="button" class="ct-faq-q" @click="toggleFaq(item.id)">
          <span class="ct-faq-q-text">{{ item.question }}</span>
          <span class="ct-faq-toggle">+</span>
        </AppButton>
        <div v-if="isOpen(item.id)" class="ct-faq-a">
          {{ item.answer }}
        </div>
      </article>
    </div>
  </section>
</template>
