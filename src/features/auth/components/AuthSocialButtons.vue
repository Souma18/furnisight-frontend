<template>
  <div class="social-wrap">
    <div class="divider">
      <span />
      <p>hoặc tiếp tục với</p>
      <span />
    </div>
    <div class="social-grid">
      <button type="button" class="social-btn">Google</button>
      <button type="button" class="social-btn">Facebook</button>
    </div>
  </div>
</template>

<style scoped>
.social-wrap {
  margin-top: 1rem;
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.9rem;
}

.divider span {
  flex: 1;
  height: 1px;
  background: var(--auth-border);
}

.divider p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--auth-text-secondary);
}

.social-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr 1fr;
}

.social-btn {
  border-radius: var(--auth-radius-md);
  border: 1px solid var(--auth-border);
  background: var(--auth-surface);
  color: var(--auth-text-primary);
  min-height: 2.4rem;
  cursor: pointer;
}
</style>
