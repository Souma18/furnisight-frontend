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
  background: var(--account-surface);
  border: 1px solid var(--auth-border);
  border-radius: 16px;
  overflow: hidden;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid var(--auth-border);
}
.card-head h3 {
  margin: 0;
  color: var(--auth-text-primary);
}
.card-body {
  padding: 1.1rem;
}
</style>
