// TODO: приём заявки — docs «Инфраструктура» → «Обработчик формы /api/lead»; ТЗ → «Форма».
// Проверка (422), ловушка website (200 без отправки), лимит 10 запросов / 10 минут с X-Real-IP (429),
// Telegram + SMTP параллельно, 200 если ушло хоть куда-то, иначе 502 (Р18, Р35, Р37, Р54, Р64).
// Заявки нигде не сохраняются; в логах нет персональных данных.
// TODO: принимать и нативный POST формы (application/x-www-form-urlencoded) без гидратации — данные не в URL;
// что показать пользователю — вопрос этапа.
export default defineEventHandler(() => {
  throw createError({ statusCode: 501, statusMessage: 'Not Implemented' })
})
