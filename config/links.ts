// Все внешние адреса сайта — только здесь (docs «Контент» → «Ссылки», Р33, Р38).
// Telegram и WhatsApp — текущие адреса из спеки, позже поменяются: правка только в этом файле.
// Подписи соцсетей — названия площадок, одинаковые в RU и EN; соцсети открываются в новой вкладке (Р33).
// Почта — mailto: (ТЗ → «Интерактив»), в новой вкладке не открывается; её подпись — t('email') из словаря.

export const links = {
  telegram: { label: 'Telegram', href: 'https://t.me/mestodsgn' },
  whatsapp: { label: 'WhatsApp', href: 'https://wa.me/79194658612' },
  instagram: { label: 'Instagram', href: 'https://www.instagram.com/mesto_dsgn/' },
  behance: { label: 'Behance', href: 'https://www.behance.net/mestostudio' },
  dprofile: { label: 'Dprofile', href: 'https://dprofile.ru/mesto.studio' },
  medium: { label: 'Medium', href: 'https://medium.com/@admin.mesto' },
  designers: { label: 'Designers', href: 'https://dsgners.ru/mesto' },
  email: { href: 'mailto:hello@mesto.studio' },
} as const

export type LinkKey = keyof typeof links
export type SocialKey = Exclude<LinkKey, 'email'>
export type LinkLocale = 'ru' | 'en'

// «Контент» → «Составы ссылок в футере» (порядок как в документе).
// Последним пунктом колонки документов — «Настройки cookie» (Р61), это не ссылка-адрес.
export const footerLinks = {
  ru: ['behance', 'dprofile', 'designers', 'telegram'],
  en: ['telegram', 'whatsapp', 'email', 'behance', 'medium', 'instagram'],
} as const satisfies Record<LinkLocale, readonly LinkKey[]>

// «Контакты» → socials.links (Р11). RU — одна колонка, как набор RU-футера;
// EN — две колонки («Компоненты» → Info card): Behance, Medium, Instagram и Telegram, WhatsApp.
export const contactsSocials = {
  ru: [['behance', 'dprofile', 'designers', 'telegram']],
  en: [
    ['behance', 'medium', 'instagram'],
    ['telegram', 'whatsapp'],
  ],
} as const satisfies Record<LinkLocale, readonly (readonly LinkKey[])[]>
