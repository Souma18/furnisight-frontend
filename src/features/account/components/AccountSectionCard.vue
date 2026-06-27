<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section class="card">
    <header class="card-head">
      <h3>{{ title }}</h3>
      <slot name="head" />
    </header>
    <div class="card-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.card {
  background: var(--acc-surface, var(--app-surface));
  border: 1px solid var(--acc-line, var(--app-border));
  border-radius: 8px;
  box-shadow: 0 18px 42px rgba(18, 32, 46, 0.055);
  overflow: hidden;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 18px 20px;
  border-bottom: 1px solid var(--acc-line, var(--app-border));
}
.card-head h3 {
  margin: 0;
  color: var(--acc-ink, var(--app-heading));
  font-size: 1.05rem;
  font-weight: 760;
  letter-spacing: 0;
}
.card-body {
  padding: 20px;
}

@media (max-width: 640px) {
  .card-head,
  .card-body {
    padding: 16px;
  }
}
</style>
