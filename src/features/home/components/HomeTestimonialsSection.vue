<script setup>
defineProps({
  testimonials: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="fade-up">
    <div class="section-head">
      <div>
        <div class="section-label">Danh gia</div>
        <h2 class="section-title">Khach hang <em>noi gi</em></h2>
      </div>
    </div>
    <div class="testimonials-grid">
      <article v-for="item in testimonials" :key="item.id" class="testi-card">
        <p class="testi-text">"{{ item.text }}"</p>
        <div class="testi-footer">
          <div>
            <div class="testi-name">{{ item.name }}</div>
            <div v-if="item.role" class="testi-role">{{ item.role }}</div>
          </div>
          <div class="testi-stars">{{ item.stars }}</div>
        </div>
      </article>
    </div>
  </section>
</template>
