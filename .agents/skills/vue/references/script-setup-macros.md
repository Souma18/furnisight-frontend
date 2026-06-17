---
name: script-setup-macros
description: Vue 3 script setup syntax and compiler macros for defining props, emits, models, and more
---

# Script Setup & Macros

`<script setup>` is the recommended syntax for Vue SFCs with Composition API. In this project, use JavaScript runtime declarations by default.

## Basic Syntax

```vue
<script setup>
// Top-level bindings are exposed to template
import { ref } from 'vue'
import MyComponent from './MyComponent.vue'

const count = ref(0)
const increment = () => count.value++
</script>

<template>
  <button @click="increment">{{ count }}</button>
  <MyComponent />
</template>
```

## defineProps

Declare component props with runtime validation.

```js
// Runtime declaration (recommended for JavaScript)
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  items: {
    type: Array,
    default: () => []
  }
})

// Short form when validation/defaults are not needed
const props = defineProps(['title', 'count'])
```

## defineEmits

Declare emitted events. Use array syntax for simple events and object syntax when validation is useful.

```js
const emit = defineEmits(['update', 'change', 'close'])

emit('update', 'new value')
emit('change', 1, 'name')
emit('close')

// Optional runtime validation
const emitWithValidation = defineEmits({
  update: (value) => typeof value === 'string',
  close: null
})
```

## defineModel

Two-way binding prop consumed via `v-model`. Available in Vue 3.4+.

```js
// Basic usage - creates "modelValue" prop
const model = defineModel({
  type: String,
  default: ''
})
model.value = 'hello'  // Emits "update:modelValue"

// Named model - consumed via v-model:name
const count = defineModel('count', {
  type: Number,
  default: 0
})

// With modifiers
const [value, modifiers] = defineModel()
if (modifiers.trim) {
  // Handle trim modifier
}

// With transformers
const [value, modifiers] = defineModel({
  get(val) { return val?.toLowerCase() },
  set(val) { return modifiers.trim ? val?.trim() : val }
})
```

Parent usage:
```vue
<Child v-model="name" />
<Child v-model:count="total" />
<Child v-model.trim="text" />
```

## defineExpose

Explicitly expose properties to parent via template refs. Components are closed by default.

```js
import { ref } from 'vue'

const count = ref(0)
const reset = () => { count.value = 0 }

defineExpose({
  count,
  reset
})
```

Parent access:
```js
const childRef = ref(null)
childRef.value?.reset()
```

## defineOptions

Declare component options without a separate `<script>` block. Available in Vue 3.3+.

```js
defineOptions({
  inheritAttrs: false,
  name: 'CustomName'
})
```

## defineSlots

`defineSlots` is mainly useful for TypeScript slot typing. In JavaScript components, prefer clear slot usage in the template and document slot contracts near the component when needed.

```vue
<template>
  <slot :item="item" :index="index" />
</template>
```

## Local Custom Directives

Use `vNameOfDirective` naming convention.

```js
const vFocus = {
  mounted: (el) => el.focus()
}

// Or import and rename
import { myDirective as vMyDirective } from './directives'
```

```vue
<template>
  <input v-focus />
</template>
```

## Top-level await

Use `await` directly in `<script setup>`. The component becomes async and must be used with `<Suspense>`.

```vue
<script setup>
const data = await fetch('/api/data').then(r => r.json())
</script>
```

<!--
Source references:
- https://vuejs.org/api/sfc-script-setup.html
-->
