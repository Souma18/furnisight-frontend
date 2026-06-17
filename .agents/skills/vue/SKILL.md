---
name: vue
description: Vue 3 Composition API, script setup macros, reactivity system, and built-in components. Use when writing Vue SFCs, defineProps/defineEmits/defineModel, watchers, or using Transition/Teleport/Suspense/KeepAlive.
metadata:
  author: Anthony Fu
  version: "2026.1.31"
  source: Generated from https://github.com/vuejs/docs, scripts at https://github.com/antfu/skills
---

# Vue

> Based on Vue 3.5. Always use Composition API with `<script setup>` using JavaScript.

## Preferences

- Prefer JavaScript over TypeScript
- Prefer `<script setup>` over `<script>` and do not add `lang="ts"` unless the user explicitly asks for TypeScript
- Use runtime props, emits, and model declarations instead of TypeScript generic declarations
- For performance, prefer `shallowRef` over `ref` if deep reactivity is not needed
- Always use Composition API over Options API
- Use props destructuring only when it keeps the code clear; otherwise keep `props` for readability

## Core

| Topic | Description | Reference |
|-------|-------------|-----------|
| Script Setup & Macros | `<script setup>`, defineProps, defineEmits, defineModel, defineExpose, defineOptions, runtime declarations | [script-setup-macros](references/script-setup-macros.md) |
| Reactivity & Lifecycle | ref, shallowRef, computed, watch, watchEffect, effectScope, lifecycle hooks, composables | [core-new-apis](references/core-new-apis.md) |

## Features

| Topic | Description | Reference |
|-------|-------------|-----------|
| Built-in Components & Directives | Transition, Teleport, Suspense, KeepAlive, v-memo, custom directives | [advanced-patterns](references/advanced-patterns.md) |

## Quick Reference

### Component Template

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update'])

const model = defineModel({
  type: String,
  default: ''
})

const doubled = computed(() => props.count * 2)

watch(() => props.title, (newVal) => {
  console.log('Title changed:', newVal)
})

onMounted(() => {
  console.log('Component mounted')
})
</script>

<template>
  <div>{{ title }} - {{ doubled }}</div>
</template>
```

### Key Imports

```js
// Reactivity
import { ref, shallowRef, computed, reactive, readonly, toRef, toRefs, toValue } from 'vue'

// Watchers
import { watch, watchEffect, watchPostEffect, onWatcherCleanup } from 'vue'

// Lifecycle
import { onMounted, onUpdated, onUnmounted, onBeforeMount, onBeforeUpdate, onBeforeUnmount } from 'vue'

// Utilities
import { nextTick, defineComponent, defineAsyncComponent } from 'vue'
```
