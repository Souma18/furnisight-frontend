<script setup>
defineProps({
  testimonials: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="hn-section js-reveal">
    <div class="hn-section-head">
      <div>
        <p class="hn-label">Danh gia</p>
        <h2 class="hn-title">Khach hang <em>noi gi</em></h2>
      </div>
    </div>

    <div class="hn-testimonials">
      <article v-for="item in testimonials" :key="item.id" class="hn-testi-card">
        <p class="hn-testi-text">"{{ item.text }}"</p>
        <div class="hn-testi-footer">
          <div>
            <h4>{{ item.name }}</h4>
            <p>{{ item.role }}</p>
          </div>
          <span>{{ item.stars }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
