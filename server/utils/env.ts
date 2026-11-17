// Серверные переменные из «Инфраструктуры» → «Переменные окружения» (имена как в docs, Н1).
// Читаются из process.env при каждом вызове, а не при сборке: образ собирается в CI без секретов,
// значения приходят из .env на сервере через docker compose.
export function serverEnv() {
  const env = process.env
  return {
    telegramBotToken: env.TELEGRAM_BOT_TOKEN ?? '',
    telegramChatId: env.TELEGRAM_CHAT_ID ?? '',
    smtpHost: env.SMTP_HOST ?? '',
    smtpPort: env.SMTP_PORT ?? '',
    smtpUser: env.SMTP_USER ?? '',
    smtpPass: env.SMTP_PASS ?? '',
    smtpSecure: env.SMTP_SECURE ?? '',
    mailFrom: env.MAIL_FROM ?? '',
    mailTo: env.MAIL_TO ?? '',
  }
}
