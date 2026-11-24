// Н50 — владелец 24.11.2026: сайт на ≥ 1024 масштабируется CSS zoom на html (--site-zoom в tokens.css, base.css).
// getBoundingClientRect, clientX/Y, scrollY и scrollTo — в пикселях окна; width/height/top/left, transform и
// offsetWidth/offsetHeight элементов — в «локальных» (до zoom). Коэффициент переводит локальные в оконные.
// Только клиент.
export function siteZoom(): number {
  const value = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--site-zoom'),
  )
  return value > 0 ? value : 1
}
