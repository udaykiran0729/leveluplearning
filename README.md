# 🎮 LevelUpLearning

<div align="center">

![LevelUpLearning Banner](https://img.shields.io/badge/LevelUpLearning-ML%20Gamified%20Education-7c3aed?style=for-the-badge&logo=gamepad)

[![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**An ML-powered gamified educational application for children aged 6–14**

*Ask questions via text, voice, or homework photo — get answers in your favourite superhero's voice!*

[Features](#-features) · [Demo](#-demo-flow) · [Setup](#-installation) · [API](#-api-endpoints) · [Architecture](#-architecture)

</div>

---

## 📸 Overview

LevelUpLearning makes learning fun by combining **AI-powered explanations** with **superhero character voices**, **gamification**, and **bilingual support**. Children can interact via text, voice, or by uploading a photo of their homework — and receive answers spoken by Doraemon, Chhota Bheem, Dora, or Spider-Man.

Built as a full-stack ML project using **Python FastAPI**, **React TypeScript**, and **PostgreSQL**.

---

## ✨ Features

### 🤖 ML Components
| Component | Technology | Purpose |
|-----------|-----------|---------|
| NLP Engine | Groq LLaMA 3.3-70B | Age-appropriate explanations |
| OCR Scanner | Tesseract OCR | Read homework/textbook images |
| Recommendation Engine | `collections.Counter` | Suggest topics based on past questions |

### 🎙️ Superhero Voice System
- **🤖 Doraemon** — Cheerful, curious, always helpful
- **💪 Chhota Bheem** — Brave, simple, enthusiastic
- **🌟 Dora the Explorer** — Energetic, encouraging, bilingual
- **🕷️ Spider-Man** — Cool, witty, motivating

Each character has a unique personality injected into the AI system prompt. gTTS converts responses to audio and streams as base64 to the frontend.

### 🎮 Gamification
- **+10 XP** for text questions · **+20 XP** for voice/image inputs
- **4 Levels:** Beginner → Explorer → Scholar → Champion
- **6 Badges:** First Question 🏅, Explorer 🌍, Scholar 📚, Champion 🏆, Voice Master 🎤, Bilingual Star 🌐
- Animated XP pop-ups and level-up banners in chat

### 🌐 Bilingual Support
- Full **English** and **Hindi** support across all input modes
- One-tap language toggle in chat navbar
- Voice recognition switches between `en-IN` and `hi-IN`
- gTTS audio output in selected language

### 🔒 Parental Controls
- PIN-protected settings page
- Daily screen time limit slider (10 min – 3 hours)
- Content topic blocklist with preset categories
- Custom blocked words input

---

## 🛠️ Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| **Frontend** | React 18, TypeScript, React Router, Recharts | Free |
| **Backend** | Python 3.10, FastAPI, Uvicorn | Free |
| **Database** | PostgreSQL 16, SQLAlchemy ORM | Free |
| **AI / NLP** | Groq API — LLaMA 3.3-70B | Free tier |
| **Voice Output** | gTTS (Google Text-to-Speech) | Free |
| **Voice Input** | Browser SpeechRecognition API | Free |
| **OCR** | Tesseract OCR | Free & open source |
| **ML Engine** | Python `collections.Counter` | Built-in |

> 💡 **100% free stack** — no paid services required

---

## 🚀 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 16 ([Download](https://www.postgresql.org/download/))
- Tesseract OCR ([Download for Windows](https://github.com/UB-Mannheim/tesseract/wiki))
- Free Groq API Key ([console.groq.com](https://console.groq.com))

---

### 1. Clone the Repository

```bash
git clone https://github.com/udaykiran0729/leveluplearning.git
cd leveluplearning
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install fastapi uvicorn psycopg2-binary sqlalchemy python-multipart
pip install python-dotenv groq pillow pytesseract speechrecognition gTTS

# Create environment file
echo GROQ_API_KEY=your_groq_api_key_here > .env
```

**Configure PostgreSQL:**
```bash
# Open pgAdmin → Create database named: leveluplearning_db
# Edit database.py line 3:
DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5433/leveluplearning_db"
```

```bash
# Create all tables
python init_db.py
# Output: All tables created successfully!

# Start the server
python main.py
# Output: Uvicorn running on http://0.0.0.0:8000
```

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# Opens http://localhost:3000
```

---

### 4. Tesseract OCR (Windows only)

1. Download from [UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)
2. Install to `C:\Program Files\Tesseract-OCR\`
3. Path already configured in `backend/main.py`

---

### 5. Verify Setup

Open two terminals and run both servers:

```
Terminal 1 → cd backend  → python main.py   (port 8000)
Terminal 2 → cd frontend → npm start        (port 3000)
```

Visit `http://localhost:8000/docs` for interactive API explorer.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users/register` | Register child profile |
| `POST` | `/ask/text` | Text question → NLP answer |
| `POST` | `/ask/voice` | Audio file → STT → answer |
| `POST` | `/ask/image` | Image → OCR → answer |
| `POST` | `/ask/voice-character` | Question → Character voice + audio |
| `GET` | `/progress/{user_id}` | Fetch XP, level, badges |
| `GET` | `/recommendations/{user_id}` | ML topic suggestions |
| `POST` | `/parent/settings` | Save parental controls |
| `POST` | `/parent/verify` | Verify parent PIN |

> 📖 Full interactive docs at `http://localhost:8000/docs`

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

## 🧠 Architecture

```
User Input (Text / Voice / Image)
          │
          ▼
   [Content Filter]
   Blocked topic? → "Topic not available 😊"
          │
          ▼
   [Input Processing]
   Text  → Direct to NLP
   Voice → SpeechRecognition → Transcript
   Image → Tesseract OCR → Extracted Text
          │
          ▼
   [Groq LLaMA 3.3-70B]
   System prompt:
   ├─ Character personality style
   ├─ Language (EN / HI)
   └─ Age-appropriate tone
          │
          ▼
   [gTTS Voice Synthesis]
   → Base64 MP3 audio → Frontend plays automatically
          │
          ▼
   [Gamification Engine]
   → +10 / +20 XP earned
   → Level threshold check
   → Badge unlock logic
          │
          ▼
   [PostgreSQL Storage]
   → Session & conversation saved
   → Topic recorded for ML
          │
          ▼
   [ML Recommendation Engine]
   collections.Counter on past topics
   → Top 3 recommended topics returned
```

---

## 📱 App Pages

| Page | Route | Description |
|------|-------|-------------|
| Register | `/` | Name, age, language toggle, hero picker |
| Select Character | `/select-character` | Choose superhero voice character |
| Chat | `/chat` | Main chat — Text / Voice / Image tabs |
| Dashboard | `/dashboard` | XP bar, badges, Recharts chart, ML recs |
| Parental Controls | `/parent` | PIN-protected safety settings |

---

## 🎯 Demo Flow

1. **Register** → Enter name, age, select English, pick Doraemon
2. **Select Hero** → Click Doraemon → "Let's Go!"
3. **Chat (Text)** → Type "What is gravity?" → Doraemon answers + voice plays
4. **Chat (Voice)** → Tap 🎤 → Say "What is photosynthesis?" → Audio response
5. **Chat (Image)** → Upload textbook photo → OCR reads + explains in character voice
6. **Language Toggle** → Tap 🇮🇳 HI → Ask question in Hindi → Hindi audio response
7. **Dashboard** → See XP progress bar, earned badges, bar chart, ML recommendations
8. **Parent Controls** → Enter PIN → Set 60 min limit → Block "violence"

---

## 📁 Project Structure

```
leveluplearning/
├── backend/
│   ├── main.py             # FastAPI app — 9 API endpoints
│   ├── models.py           # SQLAlchemy ORM — 5 database tables
│   ├── database.py         # PostgreSQL connection config
│   ├── gamification.py     # XP system, levels, badges, ML recs
│   ├── voice_service.py    # Character voice + gTTS audio
│   ├── init_db.py          # One-time database table creation
│   └── .env                # GROQ_API_KEY (not committed to git)
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Register.tsx         # Page 1 — Child registration
│       │   ├── SelectCharacter.tsx  # Page 2 — Hero selection
│       │   ├── Chat.tsx             # Page 3 — Main chat interface
│       │   ├── Dashboard.tsx        # Page 4 — Progress & badges
│       │   └── ParentControls.tsx   # Page 5 — Safety settings
│       ├── services/
│       │   └── api.ts               # Axios API service layer
│       └── App.tsx                  # React Router configuration
│
├── README.md
└── .gitignore
```

---

## 🔐 Environment Variables

Create `backend/.env` with:
```env
GROQ_API_KEY=your_groq_api_key_here
```

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## 📦 Dependencies

**Backend (`pip install`):**
```
fastapi uvicorn psycopg2-binary sqlalchemy
python-multipart python-dotenv groq
pillow pytesseract speechrecognition gTTS
```

**Frontend (`npm install`):**
```
axios react-router-dom react-icons
framer-motion recharts
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "Add amazing feature"`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [Groq](https://console.groq.com) — Free LLaMA 3.3 API
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) — Open source OCR
- [gTTS](https://gtts.readthedocs.io) — Google Text-to-Speech
- [FastAPI](https://fastapi.tiangolo.com) — Modern Python web framework
- [Recharts](https://recharts.org) — React charting library

---

<div align="center">

**Built with ❤️ by S. Uday Kiran**

*LevelUpLearning — Learn. Play. Level Up! 🚀*

⭐ Star this repo if you found it helpful!

</div>
