<script setup lang="ts">
// Демо песочницы для Form. Служебный файл /__kit, на сайт не попадает.
// Locale — язык страницы (/__kit — RU, /en/__kit — EN). Ширина образца — ширина компонента Form в Figma
// (2045:887 / 2045:908 — 806, 2045:923 / 2045:944 — 348); Small на 768 — на ширину колонки (на экране 720 / 744).
// Состояния, которые нельзя выставить props (props в Form только ради песочницы не добавляются):
// после монтирования демо заполняет поля и жмёт «Обсудить проект», а ответ сервера подменён — $fetch на
// /api/lead с именем «kit-…» не идёт в сеть. Имя задаёт исход: kit-success, kit-error, kit-sending (запрос
// не завершается — поля Disabled, у кнопки aria-busy). state «errors» отправляет пустую форму — Error полей и
// согласия. Остальные вызовы $fetch проходят как обычно.
// Успех переводит фокус на текст сообщения (ТЗ → «Форма» п. 4): чтобы несколько демо на странице не отнимали
// фокус друг у друга, в «success» фокус после сценария снимается; фокус проверяется в варианте «success-click»:
// сценарий запускает кнопка «Отправить форму (kit)» над формой — фокус остаётся на тексте успеха.
const props = withDefaults(
  defineProps<{
    size?: 'default' | 'small'
    state?: 'idle' | 'errors' | 'success' | 'success-click' | 'error' | 'sending'
  }>(),
  { size: 'default', state: 'idle' },
)

type FetchLike = typeof $fetch
const globalScope = globalThis as unknown as { $fetch: FetchLike; __kitFetchMock?: boolean }

function installFetchMock() {
  if (globalScope.__kitFetchMock) return
  globalScope.__kitFetchMock = true
  const original = globalScope.$fetch
  const mock = ((url: string, options?: { body?: { name?: string } }) => {
    const name = options?.body?.name
    if (url === '/api/lead' && typeof name === 'string' && name.startsWith('kit-')) {
      if (name === 'kit-error') return Promise.reject(new Error('kit'))
      if (name === 'kit-sending') return new Promise(() => {})
      return Promise.resolve({ ok: true })
    }
    return (original as (...args: unknown[]) => unknown)(url, options)
  }) as unknown as FetchLike
  globalScope.$fetch = Object.assign(mock, original)
}

const root = ref<HTMLElement | null>(null)

function fill(selector: string, value: string) {
  const field = root.value?.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)
  if (!field) return
  field.value = value
  field.dispatchEvent(new Event('input', { bubbles: true }))
}

async function run() {
  installFetchMock()
  const prefix = props.state === 'success-click' ? 'success' : props.state
  if (props.state !== 'errors') {
    fill('input[name="name"]', `kit-${prefix}`)
    fill('input[name="contact"]', 'hello@mesto.studio')
    root.value?.querySelector<HTMLInputElement>('input[name="consent"]')?.click()
    await nextTick()
  }
  root.value?.querySelector<HTMLButtonElement>('button[type="submit"]')?.click()
}

onMounted(async () => {
  if (props.state === 'idle' || props.state === 'success-click') return
  await run()
  if (props.state === 'success') {
    // дождаться перехода в успех и снять фокус с текста сообщения
    await new Promise((resolve) => setTimeout(resolve, 100))
    ;(document.activeElement as HTMLElement | null)?.blur()
  }
})
</script>

<template>
  <div ref="root" class="form-demo" :class="`form-demo--${size}`">
    <button v-if="state === 'success-click'" type="button" class="form-demo__run" @click="run">
      Отправить форму (kit)
    </button>
    <Form :size="size" />
  </div>
</template>

<style scoped>
.form-demo {
  max-width: 100%;
}

.form-demo--default {
  width: 806px;
  max-width: 100%;
}

.form-demo--small {
  width: 348px;
  max-width: 100%;
}

.form-demo__run {
  margin-bottom: 8px;
}

/* На 768 форма Small на экране занимает ширину колонки (720 / 744), а не 348 */
@media (min-width: 768px) {
  .form-demo--small {
    width: 100%;
  }
}
</style>
