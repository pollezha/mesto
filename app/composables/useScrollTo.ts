// Плавный скролл с учётом prefers-reduced-motion — ТЗ → «Интерактив», «Общие правила» п. 7; Р6, Р68.
// Только клиент: вызывать из обработчиков событий.
export function useScrollTo() {
  function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  function behavior(): ScrollBehavior {
    return prefersReducedMotion() ? 'auto' : 'smooth'
  }

  /** Наверх страницы. Всегда true — для сценариев «скролл или переход». */
  function scrollToTop(): boolean {
    window.scrollTo({ top: 0, behavior: behavior() })
    return true
  }

  /** К элементу с id (учитывает scroll-margin). false — элемента на странице нет. */
  function scrollToId(id: string): boolean {
    const el = document.getElementById(id)
    if (!el) return false
    el.scrollIntoView({ behavior: behavior(), block: 'start' })
    return true
  }

  // Ctrl / Cmd / Shift / Alt / не левая кнопка — не перехватываем, пусть открывается новая вкладка
  function isModifiedClick(event: MouseEvent): boolean {
    return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
  }

  return { scrollToTop, scrollToId, isModifiedClick, prefersReducedMotion }
}
