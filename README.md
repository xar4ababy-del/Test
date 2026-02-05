# Test — Auth UI (Stages 1–3)

Полная реализация интерфейса авторизации в 3 этапах:
- **ЭТАП 1**: Статический интерфейс и разметка
- **ЭТАП 2**: Валидация, ошибки и UI-состояния
- **ЭТАП 3**: API-интеграция и финальная стабилизация

---

## ЭТАП 1 — Базовая структура и статический интерфейс

✅ Статичный интерфейс авторизации (карточка) с вкладками "Вход" и "Регистрация"
- Полная HTML разметка с семантическими тегами
- Форма входа: email, password, remember me, кнопка Войти
- Форма регистрации: fullName, email, phone, dob, gender, password, passwordConfirm, terms
- Базовая стилизация (layout, цвета, адаптивность)

---

## ЭТАП 2 — Стилизация, валидация и состояния UI

✅ Финальная стилизация интерфейса
- Стили для hover, active, disabled состояний
- Адаптивный дизайн (responsive)
- Анимации ошибок и загрузки

✅ Клиентская валидация всех полей
- Email формат
- Пароль: минимум 8 символов, заглавная буква, цифра
- Full name: минимум 2 слова
- Телефон: pattern matching (+7/8...)
- Дата рождения: проверка 18+ возраста
- Выбор пола
- Подтверждение пароля (matching)
- Условия использования (checkbox)

✅ Отображение ошибок
- Field-level ошибки рядом с полями
- Аниматированное появление ошибок (slideDown)
- Автоматическое очищение ошибок при вводе
- Status messages с loading spinner

✅ UI-состояния: idle → loading → error/success
- Loading состояние с спинером
- Error состояние с красной подсветкой
- Success состояние без редиректов
- Блокировка кнопок при loading
- Очистка формы через 1.5s после success

✅ Интерактивность
- Tab switching без навигации
- Register cancel button с reset'ом состояния
- Real-time error clearing на input

---

## ЭТАП 3 — API-интеграция и финальная стабилизация

✅ Интеграция с API endpoints
- POST `/api/login` — вход в систему
- POST `/api/register` — регистрация нового пользователя
- Configurable endpoints в `src/app.js` (переменная `API_CONFIG`)

✅ Обработка ответов сервера
- Success responses (200/201) с опциональным message
- Error responses (4xx/5xx) с ошибками

✅ Маппинг серверных ошибок в UI
- Field-level ошибки формат: `{ errors: { field: "message" } }`
- General ошибки формат: `{ message: "error text" }`
- Отображение field errors рядом с полями
- Отображение general errors в status message

✅ Network error handling
- Timeout handling (30s по умолчанию)
- Graceful error messages для пользователя
- No redirects or session management

---

## Ограничения

❌ Нет редиректов — интерфейс остается на форме после успеха
❌ Нет управления сессией — session cookies не обрабатываются
❌ НетNavigationEvent или page refresh
❌ Нет добавления новой функциональности за пределами авторизации

---

## Как использовать

### Запуск сервера

\`\`\`bash
npm start
\`\`\`

Откроет http://localhost:5173 с интерфейсом авторизации.

### Конфигурация API endpoints

В файле `src/app.js` найти переменную `API_CONFIG`:

\`\`\`javascript
const API_CONFIG = {
  baseURL: '/api',
  loginEndpoint: '/api/login',
  registerEndpoint: '/api/register',
  timeout: 30000
};
\`\`\`

Измените `loginEndpoint` и `registerEndpoint` согласно вашему backend.

### API Contract

#### POST /api/login

**Request:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
\`\`\`

**Success Response (200/201):**
\`\`\`json
{
  "message": "Successfully signed in!",
  "token": "optional_jwt_token"
}
\`\`\`

**Error Response (4xx/5xx):**
\`\`\`json
{
  "errors": {
    "email": "User not found",
    "password": "Incorrect password"
  }
}
\`\`\`

или

\`\`\`json
{
  "message": "Invalid credentials"
}
\`\`\`

#### POST /api/register

**Request:**
\`\`\`json
{
  "fullName": "Ivan Ivanov",
  "email": "ivan@example.com",
  "phone": "+7 (999) 123-45-67",
  "dob": "2000-01-15",
  "gender": "male",
  "password": "SecurePassword123"
}
\`\`\`

**Success Response (200/201):**
\`\`\`json
{
  "message": "Account created successfully!"
}
\`\`\`

**Error Response (4xx/5xx):**
\`\`\`json
{
  "errors": {
    "email": "Email already registered",
    "password": "Password is too weak"
  }
}
\`\`\`

---

## Тестирование

1. **Валидация:**
   - Оставить поле пустым → ошибка
   - Ввести невалидный email → ошибка
   - Ввести слабый пароль → ошибка
   - Исправить ошибку → сообщение очистится

2. **API интеграция:**
   - Заполнить форму корректно → отправка на backend
   - Backend возвращает success → success состояние
   - Backend возвращает field errors → показать рядом с полями
   - Backend возвращает general error → показать в status message
   - Network error → показать graceful error message

3. **UI states:**
   - loading: спинер + disable кнопки
   - success: зеленое сообщение + очистка через 1.5s
   - error: красное сообщение + enable кнопки

4. **Interactions:**
   - Переключение вкладок → reset состояния
   - Register cancel → reset состояния + переход на login
   - Изменение поля → очистка ошибок

---

## Project Scope

✅ **Включено:**
- Статический интерфейс
- Клиентская валидация
- UI-состояния и анимации
- API-интеграция (login/register)
- Error handling и маппинг

❌ **Исключено:**
- Session management / cookies
- Redirects / navigation
- Password recovery / 2FA
- Social auth / OAuth
- User profiles / account management
- Any business logic beyond auth forms

---

## Architecture

\`\`\`
src/
├── index.html      # Статическая разметка
├── styles.css      # Полная стилизация
└── app.js          # Клиентская логика
    ├── Валидация
    ├── UI состояния
    └── API интеграция
\`\`\`

Модульная структура позволяет:
- Легко менять API endpoints
- Настраивать валидационные правила
- Расширять error handling
- Рефакторить без изменения UX

---