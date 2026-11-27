// Серверные переменные из «Инфраструктуры» → «Переменные окружения» (имена как в docs, Н1).
// Читаются из process.env при каждом вызове, а не при сборке: образ собирается в CI без секретов,
// значения приходят из .env на сервере через docker compose.
export function serverEnv() {
  const env = process.env
  return {
    smtpHost: env.SMTP_HOST ?? '',
    smtpPort: env.SMTP_PORT ?? '',
    smtpUser: env.SMTP_USER ?? '',
    smtpPass: env.SMTP_PASS ?? '',
    smtpSecure: env.SMTP_SECURE ?? '',
    // Н84: '6' / '4' — ходить на SMTP только по этому семейству адресов; всё остальное = пусто
    smtpFamily: env.SMTP_FAMILY === '6' ? 6 : env.SMTP_FAMILY === '4' ? 4 : null,
    mailFrom: env.MAIL_FROM ?? '',
    mailTo: env.MAIL_TO ?? '',
  }
}
