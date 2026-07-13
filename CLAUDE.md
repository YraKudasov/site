# БИМАКС ПРО — сайт компании

Статический HTML/CSS/JS сайт волгоградской компании по производству и поставке окон. Работает с 2007 года.

## Архитектура

Статический сайт без фреймворков. Единственный серверный компонент — `admin-server.js` (Node.js), нужен только для работы административной панели.

### Страницы

| Файл | Назначение |
|---|---|
| `index.html` | Главная страница |
| `about.html` | О компании |
| `brands-catalog.html` | Каталог профильных систем |
| `product-template.html` | Страница конкретного продукта |
| `employees.html` | Сотрудники + фильтр менеджеров по регионам |
| `contact.html` | Контакты + карта Яндекс |
| `privacy.html` | Политика конфиденциальности |
| `admin.html` | Административная панель (защищена JWT) |

### Компоненты (загружаются динамически)

`header.html`, `footer.html`, `sidebar.html` — не встроены в страницы, а загружаются через `fetch()` в `js/modules/components-loader.js`.

**Важно:** `innerHTML` не выполняет `<script>` теги. Поэтому любая JS-логика после вставки компонента должна вызываться из `components-loader.js` явно. Пример: год в футере устанавливается через `yearEl.textContent = new Date().getFullYear()` после вставки HTML, а не скриптом внутри `footer.html`.

## Структура JS

```
js/
  script.js                  — точка входа, инициализирует всё
  brands-loader.js           — загрузка и рендер каталога брендов
  product-loader.js          — загрузка страницы продукта
  modules/
    components-loader.js     — загрузка header/footer/sidebar через fetch
    data-loader.js           — утилиты для загрузки JSON
    ui-utils.js              — рендер выпадающего меню в хедере, сайдбара
```

Все JS-модули используют ES modules (`type="module"`).

## Данные (data/)

| Файл | Содержимое |
|---|---|
| `employees.json` | Все сотрудники по отделам (для страницы employees.html) |
| `sales-specialists.json` | Менеджеры по продажам с регионами (для фильтра) |
| `brands-data.json` | Бренды профилей для каталога |
| `products-data.json` | Продукты для страниц продуктов |
| `catalog-data.json` | Данные каталога, редактируемые через админ-панель |
| `users.json` | Учётные записи для входа в админку (хэши паролей) |

### Формат sales-specialists.json

```json
[
  {
    "id": 1,
    "name": "Фамилия Имя Отчество",
    "position": "Менеджер по продажам",
    "phone": "8-XXX-XXX-XX-XX",
    "photo": "images/employees/saler_photo.avif",
    "regions": [
      {
        "oblast": "Волгоградская обл.",
        "city": "Волгоград",
        "districts": ["Тракторозаводской", "Краснооктябрьский"]
      },
      {
        "oblast": "Волгоградская обл.",
        "city": "",
        "districts": ["Городищенский", "Дубовский"]
      },
      {
        "oblast": "Астраханская обл.",
        "city": "",
        "districts": ["Все районы"]
      }
    ]
  }
]
```

**Логика фильтра менеджеров (employees.html):**
- `city: ""` — районы области без привязки к городу. В UI отображаются через sentinel-значение `__oblast__` в селекте городов
- `districts: ["Все районы"]` — менеджер покрывает весь регион/город, совпадение по любому выбранному району
- Совпадение по городу: `selectedCity === '__oblast__' ? !region.city : region.city === selectedCity`
- JSON чувствителен к trailing commas — после удаления элементов проверять

## Стили

Все стили в `css/style.css` (один файл). Исключение — `css/employees.css` для страницы сотрудников.

Мобильный breakpoint: **< 480px**. Адаптив через `@media (max-width: 480px)`.

Для адаптивной типографики используется `clamp()`:
```css
font-size: clamp(минимум, вьюпорт, максимум);
```

Шрифт — Montserrat, загружается локально из `fonts/`. Google Fonts не используется и не добавлять.

## Серверная часть (admin-server.js)

Node.js HTTP-сервер без фреймворков. Запускается отдельно от статики.

- **Dev:** `npm run dev` — запускается с livereload
- **Prod:** `npm start` — `NODE_ENV=production`, livereload отключён
- **Порт:** 3001 (или `process.env.PORT`)
- **Аутентификация:** JWT, токен живёт 1 час
- **Секреты:** читаются из `.env` (`JWT_SECRET`, `PORT`, `ADMIN_PASSWORD`)

API-эндпоинты: `/api/login`, `/api/catalog`, `/api/brand-images`, `/api/product-images`, `/api/upload-*`, `/api/delete-*`, `/api/documents`, `/api/posters`.

## Изображения

```
images/
  logo.png              — логотип компании
  partners/             — логотипы партнёров (Alneo, KBE, Kommerling, TopLine, GU, TBM, Futurus)
  brands/               — изображения брендов профилей
  products/             — изображения продуктов
  employees/            — фото сотрудников (saler_photo.avif — заглушка)
  main_page/            — фото для главной страницы
```

## Что не менять без причины

- Не добавлять Google Fonts — используется локальный Montserrat
- Не добавлять `<script>` теги в `header.html` / `footer.html` — они не выполнятся
- Мобильный breakpoint — 480px, не 768px
- Год основания компании — **2007**
- Git коммиты — только от имени пользователя, без co-author Claude
