import { loadCounters } from '~/utils/analytics'

// После монтирования: показать баннер (если выбора нет) и сразу загрузить счётчики при accepted (Р22, Р58).
// Cookie при этом не переписываем, чтобы срок не продлевался сам собой.
export default defineNuxtPlugin((nuxtApp) => {
  const consent = useConsent()
  const ready = useState('consent-ready')
  const config = useRuntimeConfig()
  nuxtApp.hook('app:mounted', () => {
    ready.value = true
    if (consent.enabled.value && consent.choice.value === 'accepted') {
      loadCounters({
        gaId: String(config.public.gaId || '').trim(),
        ymId: String(config.public.ymId || '').trim(),
      })
    }
  })
})
