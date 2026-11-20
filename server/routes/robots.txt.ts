import { SITE_URL } from '../../config/site'

// robots.txt — генерируется при сборке (nitro.prerender.routes): Allow: / и ссылка на sitemap.
export default defineEventHandler((event) => {
  const origin = (useRuntimeConfig(event).public.siteUrl || SITE_URL).replace(/\/+$/, '')
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
})
