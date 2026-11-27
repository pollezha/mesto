import { computed, reactive, readonly, ref } from 'vue'
import { reportLeadGoal } from '~/utils/analytics'

// Логика формы заявки: ТЗ → «Форма»; «Инфраструктура» → «Обработчик формы /api/lead».
export type LeadField = 'name' | 'contact' | 'message'
export type LeadStatus = 'idle' | 'sending' | 'success' | 'error'

// Р64: имя и контакт — до 100 символов, описание — до 2000.
export const LEAD_LIMITS = { name: 100, contact: 100, message: 2000 } as const

export function useLeadForm() {
  const { locale } = useI18n()
  const route = useRoute()

  const values = reactive({
    name: '',
    contact: '',
    message: '',
    consent: false,
    newsletter: false,
    website: '', // ловушка для ботов
  })
  const errors = reactive({ name: false, contact: false, consent: false })
  const status = ref<LeadStatus>('idle')
  const isRu = computed(() => locale.value === 'ru')

  function clearError(field: 'name' | 'contact' | 'consent') {
    errors[field] = false
  }

  async function submit() {
    if (status.value === 'sending' || status.value === 'success') return

    // Формат контакта не проверяется (Р34).
    errors.name = values.name.trim() === ''
    errors.contact = values.contact.trim() === ''
    // Н80: согласие обязательно и на EN (владелец 27.11.2026)
    errors.consent = !values.consent
    if (errors.name || errors.contact || errors.consent) return

    status.value = 'sending'
    const ru = isRu.value
    const payload = {
      name: values.name,
      contact: values.contact,
      message: values.message,
      consent: values.consent,
      newsletter: ru ? values.newsletter : false,
      locale: locale.value,
      page: route.path,
      website: values.website,
    }
    try {
      await $fetch('/api/lead', { method: 'POST', body: payload })
    } catch {
      status.value = 'error'
      return
    }
    status.value = 'success'
    reportLeadGoal({ locale: payload.locale, page: payload.page })
  }

  return { values, errors, status: readonly(status), isRu, clearError, submit }
}
