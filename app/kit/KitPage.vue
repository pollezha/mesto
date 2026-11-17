<script setup lang="ts">
// Песочница компонентов. Служебная страница: подписи и раскладка здесь — не часть сайта,
// правила токенов и словарей к ним не относятся. Фильтр: /__kit?c=Button,Tag
import { kit } from './registry'

const route = useRoute()

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const entries = computed(() => {
  const only = typeof route.query.c === 'string' ? route.query.c.split(',') : null
  return only ? kit.filter((entry) => only.includes(entry.name)) : kit
})
</script>

<template>
  <main class="kit">
    <p v-if="!entries.length" class="kit__label">
      Песочница пуста: компоненты регистрируются в app/kit/registry.ts
    </p>
    <section v-for="entry in entries" :id="entry.name" :key="entry.name" class="kit__section">
      <h2 class="kit__label">{{ entry.name }} · Figma {{ entry.figma }}</h2>
      <div
        v-for="variant in entry.variants"
        :key="variant.label"
        class="kit__item"
        :data-kit-item="entry.name"
        :data-kit-variant="variant.label"
        :data-kit-widths="variant.widths?.join(',')"
      >
        <p class="kit__label">{{ variant.label }}</p>
        <div class="kit__stage" data-kit-stage>
          <component :is="entry.component" v-bind="variant.props">
            <template v-if="variant.slot">{{ variant.slot }}</template>
          </component>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.kit {
  display: grid;
  gap: 48px;
  padding: 24px 0;
}

.kit__section {
  display: grid;
  gap: 24px;
}

.kit__item {
  display: grid;
  gap: 8px;
}

.kit__label {
  margin: 0;
  padding: 0 8px;
  font: 12px/16px monospace;
  color: #737373;
}

.kit__stage {
  display: flow-root;
}
</style>
