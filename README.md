# MindSweeper 🧠💣

> Не просто Сапёр. Тренажёр вероятностного мышления.

**Live demo:** [mindsweeper-xi.vercel.app](https://mindsweeper-xi.vercel.app)  
**GitHub:** [github.com/azaanorbank-max/mindsweeper](https://github.com/azaanorbank-max/mindsweeper)

---

## Что это такое

MindSweeper — это Сапёр, в котором каждый ход становится уроком.

Большинство людей играют в Сапёр на угадывание. MindSweeper показывает что угадывание — 
это не стратегия, а симптом непривычки считать вероятности. Продукт превращает игру 
в тренажёр принятия решений под неопределённостью — навыка, который нужен в бизнесе, 
аналитике и жизни.

---

## Для кого

- **Аналитики и менеджеры** — прокачка структурного мышления в игровом формате
- **Студенты** — развитие вероятностной интуиции
- **Все кто хочет мыслить точнее** — не угадывать, а считать

---

## Три фичи которых нет нигде

### 1. Probability Overlay — видишь риски в реальном времени
На каждой скрытой клетке отображается вероятность мины в процентах.
Зелёный (0–25%) → жёлтый (26–60%) → красный (61–100%).
Ты не угадываешь — ты видишь математику и принимаешь осознанное решение.

### 2. AI Coach — разбор каждой игры
После каждой партии Claude анализирует твои ходы:
- Где ты открыл клетку с 70% вероятностью мины когда рядом была с 10%
- Где принял оптимальное решение
- Каков твой стиль мышления в целом

Пример инсайта:
> "Ход №12: ты открыл клетку с вероятностью 67%. Рядом была клетка с 12%.
> Это импульсивное решение — риск был в 5 раз выше необходимого."

### 3. Профиль мышления — твоя аналитика
Накопительная статистика показывает как ты мыслишь:
- **Импульсивный** (часто открываешь клетки с высоким риском)
- **Сбалансированный** (иногда рискуешь, иногда считаешь)
- **Аналитик** (всегда выбираешь минимальный риск)

График прогресса, streak, лучшие времена по уровням сложности.

---

## Daily Challenge

Каждый день все игроки получают одинаковое поле — seed генерируется из даты.
После победы можно поделиться результатом в виде эмодзи-сетки (как в Wordle).
Глобальный рейтинг дня.

---

## Архитектура

```
Пользователь (Web / Mobile PWA)
        ↓
React + TypeScript + Tailwind CSS + Vite
        ↓
┌──────────────────┬────────────────┬──────────────────┐
│  Game Engine     │   AI Coach     │    Storage       │
│  minesweeper.ts  │   Claude API   │  LocalStorage    │
│  probability.ts  │   Insights[]   │  Supabase (v2)   │
│  daily.ts        │                │  Leaderboard     │
└──────────────────┴────────────────┴──────────────────┘
        ↓
Сущности: Cell · Move · Insight · Game · UserProfile
```

**Поток данных после игры:**
Игра завершена → moves[] + probabilities → Claude API → Insights[] → Профиль обновлён

---

## Стек

| Категория | Технология |
|---|---|
| Frontend | React 18 + TypeScript |
| Стили | Tailwind CSS (mobile-first) |
| Сборка | Vite |
| AI | Anthropic Claude API |
| Хранение | LocalStorage (MVP) / Supabase (v2) |
| Деплой | Vercel |
| PWA | manifest.json + service worker |

---

## Запуск локально

```bash
git clone https://github.com/azaanorbank-max/mindsweeper
cd mindsweeper
npm install

# Создай .env файл
cp .env.example .env
# Добавь свой Anthropic API key в .env:
# VITE_ANTHROPIC_API_KEY=your_key_here

npm run dev
```

Открой [http://localhost:5173](http://localhost:5173)

---

## Деплой на Vercel

```bash
npm i -g vercel
vercel --prod
```

---

## Скриншоты

### Web
<img width="1492" height="778" alt="image" src="https://github.com/user-attachments/assets/08d73959-d8cd-4e23-94ee-1afee516fc0a" />
<img width="1191" height="747" alt="image" src="https://github.com/user-attachments/assets/7a4b91e7-a4cc-48ad-a19a-e3a48704fde3" />
<img width="583" height="677" alt="image" src="https://github.com/user-attachments/assets/c03df923-92ff-44b3-99e6-c98bd827b062" />
<img width="517" height="765" alt="image" src="https://github.com/user-attachments/assets/d8df3406-ed82-4a61-9fc2-f4bce2bc5ef2" />


### Mobile
<img width="415" height="710" alt="image" src="https://github.com/user-attachments/assets/db76cc59-d1dc-4fa5-b22f-664c832db848" />
<img width="402" height="703" alt="image" src="https://github.com/user-attachments/assets/ce16bbee-6fe8-4a0e-a2e4-3294528bb1a5" />



---

## Бизнес-потенциал

**Freemium модель:**
- Бесплатно: полная игра, Probability Overlay, 3 AI-разбора в день
- Pro ($5/мес): безлимитный AI Coach, расширенная аналитика, кастомные темы

**B2B:**
- Корпоративный тренинг "Принятие решений под неопределённостью"
- Интеграция в онбординг для аналитиков и менеджеров

---

## Идея и контекст

Концепция MindSweeper вырастает из книги
["Навык на миллиард"](https://amazon.com) и платформы LifeOS — 
инструментов для развития системного мышления.

В Сапёре каждая клетка — это узел с атрибутами и вероятностями.
Умение читать систему, видеть риски и выбирать оптимальный ход — 
это и есть системное мышление в действии.

MindSweeper делает этот навык измеримым и тренируемым.
