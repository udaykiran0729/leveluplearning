# 🎮 LevelUpLearning
### ML-Based Gamified Educational Application
**Department of Computer Science & Engineering | MLR Institute of Technology**
**III CSE Mini Project | A.Y. 2024-25 | Batch D13**

---

## 👥 Team

| Name | Roll No | Role |
|------|---------|------|
| S. Uday Kiran | 23R21A05Q6 | Team Leader |
| N. Sumanth Chowdary | 23R21A05N9 | Backend Developer |
| Shreya Dhokate | 23R21A05Q9 | Frontend Developer |
| B. Nagaraju | 23R21A05L1 | ML & Database |

**Guide:** Mrs. A. Sangeetha

---

## 📖 About

LevelUpLearning is an ML-powered gamified educational app for children aged **6–14**. Children can ask questions via **text, voice, or homework image**, and receive answers in the voice of their favourite superhero character (Doraemon, Chhota Bheem, Dora, or Spider-Man) in **English or Hindi**.

The app uses **NLP, OCR, and an adaptive recommendation engine** to personalise learning, while **gamification** (XP points, levels, badges) keeps children engaged.

---

## ✨ Features

### 🤖 ML Components
- **NLP Engine** — Groq LLaMA 3.3-70B generates age-appropriate explanations
- **OCR Scanner** — Tesseract reads homework/textbook images and explains content
- **Adaptive Recommendations** — `collections.Counter` frequency analysis recommends topics based on past questions

### 🎙️ Superhero Voice System
- **Doraemon** — Cheerful & curious
- **Chhota Bheem** — Brave & enthusiastic
- **Dora the Explorer** — Energetic & bilingual
- **Spider-Man** — Cool & witty
- Each character has a unique personality injected into the AI prompt
- gTTS converts text to audio and streams it to the frontend

### 🎮 Gamification
- +10 XP for text questions, +20 XP for voice/image inputs
- 4 levels: Beginner → Explorer → Scholar → Champion
- 6 collectible badges: First Question, Explorer, Scholar, Champion, Voice Master, Bilingual Star
- Animated XP pop-ups and level-up banners in chat

### 🌐 Bilingual Support
- Full English and Hindi support across all input types
- Language toggle button in chat navbar
- Voice recognition switches between `en-IN` and `hi-IN`
- gTTS outputs audio in selected language

### 🔒 Parental Controls
- PIN-protected settings page
- Daily screen time limit (10 min – 3 hours)
- Content topic blocklist (Violence, Gambling, Drugs, etc.)
- Custom blocked words support

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, React Router, Recharts |
| **Backend** | Python 3.10, FastAPI, Uvicorn |
| **Database** | PostgreSQL 16, SQLAlchemy ORM |
| **AI / NLP** | Groq API (LLaMA 3.3-70B) — Free tier |
| **Voice Output** | gTTS (Google Text-to-Speech) — Free |
| **Voice Input** | Browser SpeechRecognition API — Free |
| **OCR** | Tesseract OCR — Free & open source |
| **ML Engine** | Python `collections.Counter` — Built-in |

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 16
- Tesseract OCR ([Download](https://github.com/UB-Mannheim/tesseract/wiki))
- Groq API Key (Free at [console.groq.com](https://console.groq.com))

---

### Backend Setup

```bash
# 1. Clone and navigate
cd leveluplearning/backend

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# 3. Install dependencies
pip install fastapi uvicorn psycopg2-binary sqlalchemy python-multipart
pip install python-dotenv groq pillow pytesseract speechrecognition gTTS

# 4. Create .env file
echo GROQ_API_KEY=your_groq_key_here > .env

# 5. Set up PostgreSQL
# Open pgAdmin → Create database: leveluplearning_db
# Update database.py with your password and port

# 6. Create tables
python init_db.py

# 7. Start server
python main.py
# ✅ Running at http://localhost:8000
```

---

### Frontend Setup

```bash
# 1. Navigate to frontend
cd leveluplearning/frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm start
# ✅ Running at http://localhost:3000
```

---

### Tesseract Setup (Windows)

1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install to `C:\Program Files\Tesseract-OCR\`
3. Path in `main.py` is already configured

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | Register child profile |
| POST | `/ask/text` | Text question → NLP answer |
| POST | `/ask/voice` | Audio file → STT → answer |
| POST | `/ask/image` | Image → OCR → answer |
| POST | `/ask/voice-character` | Question → Character voice answer + audio |
| GET | `/progress/{user_id}` | Fetch XP, level, badges |
| GET | `/recommendations/{user_id}` | ML-based topic suggestions |
| POST | `/parent/settings` | Save parental controls |
| POST | `/parent/verify` | Verify parent PIN |

**Interactive API Docs:** http://localhost:8000/docs

---

## 🗃️ Database Schema

```
users           → id, name, age, language, avatar, created_at
sessions        → id, user_id, topic, started_at
progress        → id, user_id, points, level, badges_json
conversations   → id, session_id, role, message, voice_char, timestamp
parent_settings → id, user_id, max_daily_minutes, blocked_topics, password_hash
```

---

## 📱 App Pages

| Page | Route | Description |
|------|-------|-------------|
| Register | `/` | Name, age, language, hero selection |
| Select Character | `/select-character` | Choose superhero voice |
| Chat | `/chat` | Main chat with text/voice/image tabs |
| Dashboard | `/dashboard` | XP, badges, chart, ML recommendations |
| Parental Controls | `/parent` | PIN-protected safety settings |

---

## 🧠 ML Architecture

```
User Question
     │
     ▼
[Content Filter] ──── Blocked? ──→ "Topic not available" message
     │ 
     ▼
[Input Processing]
  Text  →  Direct to NLP
  Voice →  SpeechRecognition API → Transcript
  Image →  Tesseract OCR → Extracted Text
     │
     ▼
[Groq LLaMA 3.3-70B NLP]
  System prompt includes:
  - Character personality
  - Language instruction
  - Age-appropriate tone
     │
     ▼
[gTTS Voice Synthesis]
  → Base64 MP3 audio
     │
     ▼
[Gamification Engine]
  → +10/+20 XP
  → Level check
  → Badge unlock
     │
     ▼
[PostgreSQL Storage]
  → Session saved
  → Topic recorded
     │
     ▼
[ML Recommendation Engine]
  collections.Counter on past topics
  → Top 3 recommended topics
```

---

## 🎯 Demo Flow

1. **Register** → Enter name "Uday", age 12, English, pick Doraemon
2. **Select Hero** → Choose Doraemon
3. **Chat - Text** → Ask "What is gravity?" → Doraemon answers in cheerful style + voice plays
4. **Chat - Voice** → Tap mic → Say "What is photosynthesis?" → Answer with audio
5. **Chat - Image** → Upload textbook photo → OCR reads + explains
6. **Language Toggle** → Switch to Hindi → Ask same question in Hindi
7. **Dashboard** → See XP bar, badges earned, Recharts bar chart, ML topic recommendations
8. **Parent Controls** → Enter PIN → Set 60 min daily limit → Block "violence"

---

## 📁 Project Structure

```
leveluplearning/
├── backend/
│   ├── main.py           # FastAPI routes (9 endpoints)
│   ├── models.py         # SQLAlchemy ORM models (5 tables)
│   ├── database.py       # PostgreSQL connection
│   ├── gamification.py   # XP, levels, badges, ML recommendations
│   ├── voice_service.py  # Character voice + gTTS
│   ├── init_db.py        # Database initialisation
│   └── .env              # GROQ_API_KEY (not committed)
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Register.tsx         # Page 1
        │   ├── SelectCharacter.tsx  # Page 2
        │   ├── Chat.tsx             # Page 3 (main)
        │   ├── Dashboard.tsx        # Page 4
        │   └── ParentControls.tsx   # Page 5
        ├── services/
        │   └── api.ts               # Axios API calls
        └── App.tsx                  # React Router setup
```

---

## 🏆 Evaluation Criteria Coverage

| Criteria | Implementation |
|----------|---------------|
| ✅ ML-Based | NLP (Groq), OCR (Tesseract), Recommendation (Counter) |
| ✅ Database | PostgreSQL with 5 tables, SQLAlchemy ORM |
| ✅ Backend | FastAPI Python with 9 REST endpoints |
| ✅ Frontend | React TypeScript with 5 pages |
| ✅ Innovation | Superhero voices, bilingual, gamification |
| ✅ Safety | Content filter, parental controls, PIN |

---

*LevelUpLearning — Learn. Play. Level Up! 🚀*
