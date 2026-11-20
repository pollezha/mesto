// sitemap.xml — генерируется при сборке (nitro.prerender.routes), в рантайме отдаётся статикой.
// Все страницы обеих локалей, кроме 404 и выключенных EN-маршрутов; адреса абсолютные, без слэша.
import { SITE_URL, sitePaths } from '../../config/site'

export default defineEventHandler((event) => {
  const origin = (useRuntimeConfig(event).public.siteUrl || SITE_URL).replace(/\/+$/, '')
  const urls = sitePaths.map(
    (path) => `  <url><loc>${origin}${path === '/' ? '' : path}</loc></url>`,
  )
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
})
