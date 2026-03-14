from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, engine
from models import User, Progress, Conversation, Session as ChatSession
from dotenv import load_dotenv
from groq import Groq
import pytesseract
from PIL import Image
import speech_recognition as sr
import json, os, io
from voice_service import generate_character_response
from gamification import (
    update_progress,
    get_recommendations,
    set_parental_controls,
    verify_parental_pin,
    is_topic_blocked,
)

load_dotenv()

app = FastAPI(title="LevelUpLearning API")

# CORS for React on port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Tesseract path (Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


# ─── HELPER: Get AI answer ─────────────────────────────────────────────────────
def get_ai_answer(question: str, language: str = "english", character: str = "doraemon"):
    VOICE_STYLES = {
        "doraemon":     "You are Doraemon — cheerful, curious, and always helpful! Use simple fun words.",
        "chhota_bheem": "You are Chhota Bheem — brave, simple, and enthusiastic! Keep answers short and exciting.",
        "dora":         "You are Dora the Explorer — energetic and encouraging! Ask the child to repeat key words.",
        "spiderman":    "You are Spider-Man — cool, witty, and motivating! Use superhero analogies.",
    }

    lang_instruction = "Reply only in Hindi." if language == "hindi" else "Reply only in English."
    character_style  = VOICE_STYLES.get(character, VOICE_STYLES["doraemon"])

    system_prompt = f"""
    You are a fun educational assistant for children aged 6 to 14.
    {character_style}
    {lang_instruction}
    Speak in simple, age-appropriate language.
    Keep answers under 4 sentences. Always end with one encouraging sentence.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": question},
        ],
        max_tokens=300,
    )
    return response.choices[0].message.content


# ════════════════════════════════════════════════════════════════════════════════
# ROUTE 1 — Register child profile
# ════════════════════════════════════════════════════════════════════════════════
@app.post("/users/register")
def register_user(
    name:     str = Form(...),
    age:      int = Form(...),
    language: str = Form("english"),
    avatar:   str = Form("doraemon"),
    db: Session = Depends(get_db),
):
    user = User(name=name, age=age, language=language, avatar=avatar)
    db.add(user)
    db.commit()
    db.refresh(user)

    progress = Progress(user_id=user.id, points=0, level=1, badges_json="[]")
    db.add(progress)
    db.commit()

    return {
        "message":  "User registered successfully!",
        "user_id":  user.id,
        "name":     user.name,
        "avatar":   user.avatar,
        "language": user.language,
    }


# ════════════════════════════════════════════════════════════════════════════════
# ROUTE 2 — Ask via text
# ════════════════════════════════════════════════════════════════════════════════
@app.post("/ask/text")
def ask_text(
    user_id:   int = Form(...),
    question:  str = Form(...),
    language:  str = Form("english"),
    character: str = Form("doraemon"),
    db: Session = Depends(get_db),
):
    if is_topic_blocked(user_id, question, db):
        return {"answer": "Oops! That topic is not available. Ask me something else! 😊"}

    answer   = get_ai_answer(question, language, character)
    progress = update_progress(user_id, "text", db)

    session = ChatSession(user_id=user_id, topic=question[:50])
    db.add(session)
    db.commit()
    db.refresh(session)

    db.add(Conversation(session_id=session.id, role="user",      message=question, voice_char=character))
    db.add(Conversation(session_id=session.id, role="assistant", message=answer,   voice_char=character))
    db.commit()

    return {
        "answer":        answer,
        "points":        progress["points"],
        "level":         progress["level"],
        "level_name":    progress["level_name"],
        "level_up":      progress["level_up"],
        "badges":        progress["badges"],
        "new_badge":     progress["new_badge"],
        "points_earned": progress["points_earned"],
    }


# ════════════════════════════════════════════════════════════════════════════════
# ROUTE 3 — Ask via voice (audio file → STT → AI)
# ════════════════════════════════════════════════════════════════════════════════
@app.post("/ask/voice")
def ask_voice(
    user_id:   int        = Form(...),
    language:  str        = Form("english"),
    character: str        = Form("doraemon"),
    audio:     UploadFile = File(...),
    db: Session = Depends(get_db),
):
    recognizer = sr.Recognizer()
    audio_data = audio.file.read()

    with sr.AudioFile(io.BytesIO(audio_data)) as source:
        audio_recorded = recognizer.record(source)

    try:
        lang_code = "hi-IN" if language == "hindi" else "en-IN"
        question  = recognizer.recognize_google(audio_recorded, language=lang_code)
    except sr.UnknownValueError:
        return {"error": "Could not understand audio. Please speak clearly!"}

    if is_topic_blocked(user_id, question, db):
        return {"answer": "Oops! That topic is not available. Ask me something else! 😊"}

    answer   = get_ai_answer(question, language, character)
    progress = update_progress(user_id, "voice", db)

    session = ChatSession(user_id=user_id, topic=question[:50])
    db.add(session)
    db.commit()
    db.refresh(session)

    db.add(Conversation(session_id=session.id, role="user",      message=question, voice_char=character))
    db.add(Conversation(session_id=session.id, role="assistant", message=answer,   voice_char=character))
    db.commit()

    return {
        "question":      question,
        "answer":        answer,
        "points":        progress["points"],
        "level":         progress["level"],
        "level_name":    progress["level_name"],
        "level_up":      progress["level_up"],
        "badges":        progress["badges"],
        "new_badge":     progress["new_badge"],
        "points_earned": progress["points_earned"],
    }


# ════════════════════════════════════════════════════════════════════════════════
# ROUTE 4 — Ask via image (OCR → AI)
# ════════════════════════════════════════════════════════════════════════════════
@app.post("/ask/image")
def ask_image(
    user_id:   int        = Form(...),
    language:  str        = Form("english"),
    character: str        = Form("doraemon"),
    image:     UploadFile = File(...),
    db: Session = Depends(get_db),
):
    image_data = image.file.read()
    pil_image  = Image.open(io.BytesIO(image_data))
    extracted  = pytesseract.image_to_string(pil_image).strip()

    if not extracted:
        return {"error": "No text found in image. Try a clearer photo!"}

    if is_topic_blocked(user_id, extracted, db):
        return {"answer": "Oops! That topic is not available. Ask me something else! 😊"}

    question = f"Please explain this in simple words for a child: {extracted}"
    answer   = get_ai_answer(question, language, character)
    progress = update_progress(user_id, "image", db)

    session = ChatSession(user_id=user_id, topic=extracted[:50])
    db.add(session)
    db.commit()
    db.refresh(session)

    db.add(Conversation(session_id=session.id, role="user",      message=extracted, voice_char=character))
    db.add(Conversation(session_id=session.id, role="assistant", message=answer,    voice_char=character))
    db.commit()

    return {
        "extracted_text": extracted,
        "answer":         answer,
        "points":         progress["points"],
        "level":          progress["level"],
        "level_name":     progress["level_name"],
        "level_up":       progress["level_up"],
        "badges":         progress["badges"],
        "new_badge":      progress["new_badge"],
        "points_earned":  progress["points_earned"],
    }


# ════════════════════════════════════════════════════════════════════════════════
# ROUTE 5 — Ask with superhero character voice
# ════════════════════════════════════════════════════════════════════════════════
@app.post("/ask/voice-character")
def ask_voice_character(
    user_id:   int = Form(...),
    question:  str = Form(...),
    character: str = Form("doraemon"),
    language:  str = Form("english"),
    db: Session = Depends(get_db),
):
    if is_topic_blocked(user_id, question, db):
        return {"answer": "Oops! That topic is not available. Ask me something else! 😊"}

    result   = generate_character_response(question, character, language)
    progress = update_progress(user_id, "voice_character", db)

    session = ChatSession(user_id=user_id, topic=question[:50])
    db.add(session)
    db.commit()
    db.refresh(session)

    db.add(Conversation(
        session_id=session.id,
        role="user",
        message=question,
        voice_char=character,
    ))
    db.add(Conversation(
        session_id=session.id,
        role="assistant",
        message=result["answer"],
        voice_char=character,
    ))
    db.commit()

    return {
        "answer":        result["answer"],
        "audio_base64":  result["audio_base64"],
        "character":     character,
        "points":        progress["points"],
        "level":         progress["level"],
        "level_name":    progress["level_name"],
        "level_up":      progress["level_up"],
        "badges":        progress["badges"],
        "new_badge":     progress["new_badge"],
        "points_earned": progress["points_earned"],
    }


# ════════════════════════════════════════════════════════════════════════════════
# ROUTE 6 — Get progress
# ════════════════════════════════════════════════════════════════════════════════
@app.get("/progress/{user_id}")
def get_progress(user_id: int, db: Session = Depends(get_db)):
    progress = db.query(Progress).filter(Progress.user_id == user_id).first()
    if not progress:
        return {"error": "User not found"}

    LEVELS         = {1: "Beginner", 2: "Explorer", 3: "Scholar", 4: "Champion"}
    next_threshold = {1: 100, 2: 300, 3: 600, 4: 600}

    return {
        "user_id":        user_id,
        "points":         progress.points,
        "level":          progress.level,
        "level_name":     LEVELS[progress.level],
        "badges":         json.loads(progress.badges_json),
        "next_level_at":  next_threshold[progress.level],
        "points_to_next": max(0, next_threshold[progress.level] - progress.points),
    }


# ════════════════════════════════════════════════════════════════════════════════
# ROUTE 7 — ML Recommendations
# ════════════════════════════════════════════════════════════════════════════════
@app.get("/recommendations/{user_id}")
def recommendations(user_id: int, db: Session = Depends(get_db)):
    return get_recommendations(user_id, db)


# ════════════════════════════════════════════════════════════════════════════════
# ROUTE 8 — Set parental controls
# ════════════════════════════════════════════════════════════════════════════════
@app.post("/parent/settings")
def parent_settings(
    user_id:           int = Form(...),
    password:          str = Form(...),
    max_daily_minutes: int = Form(60),
    blocked_topics:    str = Form("[]"),
    db: Session = Depends(get_db),
):
    topics = json.loads(blocked_topics)
    return set_parental_controls(user_id, password, max_daily_minutes, topics, db)


# ════════════════════════════════════════════════════════════════════════════════
# ROUTE 9 — Verify parental PIN
# ════════════════════════════════════════════════════════════════════════════════
@app.post("/parent/verify")
def parent_verify(
    user_id:  int = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    valid = verify_parental_pin(user_id, password, db)
    return {"valid": valid, "message": "Access granted!" if valid else "Wrong PIN!"}


# ════════════════════════════════════════════════════════════════════════════════
# RUN SERVER — always at the very bottom
# ════════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)