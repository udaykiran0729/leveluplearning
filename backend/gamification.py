from sqlalchemy.orm import Session as DBSession
from models import Progress, Session as ChatSession, ParentSettings
from collections import Counter
import hashlib
import json

# ─── POINTS CONFIG ────────────────────────────────────────────────────────────
POINTS = {
    "text":            10,
    "voice":           20,
    "image":           20,
    "voice_character": 10,
}

# ─── LEVEL THRESHOLDS ─────────────────────────────────────────────────────────
LEVELS = {
    1: {"name": "Beginner",  "min": 0,   "max": 99},
    2: {"name": "Explorer",  "min": 100, "max": 299},
    3: {"name": "Scholar",   "min": 300, "max": 599},
    4: {"name": "Champion",  "min": 600, "max": 99999},
}

# ─── BADGE CHECKER ────────────────────────────────────────────────────────────
def check_badges(progress, sessions: list) -> tuple:
    badges    = json.loads(progress.badges_json)
    new_badge = None

    if progress.points >= 10 and "First Question" not in badges:
        badges.append("First Question")
        new_badge = "First Question"

    if progress.points >= 100 and "Explorer Badge" not in badges:
        badges.append("Explorer Badge")
        new_badge = "Explorer Badge"

    if progress.points >= 300 and "Scholar Badge" not in badges:
        badges.append("Scholar Badge")
        new_badge = "Scholar Badge"

    if progress.points >= 600 and "Champion Badge" not in badges:
        badges.append("Champion Badge")
        new_badge = "Champion Badge"

    voice_count = sum(1 for s in sessions if "voice" in (s.topic or "").lower())
    if voice_count >= 5 and "Voice Master" not in badges:
        badges.append("Voice Master")
        new_badge = "Voice Master"

    if len(sessions) >= 10 and "Bilingual Star" not in badges:
        badges.append("Bilingual Star")
        new_badge = "Bilingual Star"

    return badges, new_badge


# ─── MAIN: ADD POINTS + LEVEL UP ──────────────────────────────────────────────
def update_progress(user_id: int, input_type: str, db: DBSession) -> dict:
    points_earned = POINTS.get(input_type, 10)

    progress = db.query(Progress).filter(Progress.user_id == user_id).first()
    if not progress:
        progress = Progress(user_id=user_id, points=0, level=1, badges_json="[]")
        db.add(progress)
        db.commit()

    old_level        = progress.level
    progress.points += points_earned

    # Calculate new level
    new_level = 1
    for lvl, data in LEVELS.items():
        if progress.points >= data["min"]:
            new_level = lvl
    progress.level = new_level

    # Check badges
    sessions             = db.query(ChatSession).filter(ChatSession.user_id == user_id).all()
    badges, new_badge    = check_badges(progress, sessions)
    progress.badges_json = json.dumps(badges)

    db.commit()

    level_up = new_level > old_level

    return {
        "points":        progress.points,
        "points_earned": points_earned,
        "level":         progress.level,
        "level_name":    LEVELS[progress.level]["name"],
        "level_up":      level_up,
        "badges":        badges,
        "new_badge":     new_badge,
        "next_level_at": LEVELS[min(progress.level + 1, 4)]["min"],
    }


# ─── ML: TOPIC FREQUENCY RECOMMENDATION ──────────────────────────────────────
STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "what",
    "how", "why", "when", "who", "does", "do", "did", "in",
    "of", "to", "and", "or", "for", "me", "my", "i", "can",
    "please", "tell", "explain", "about", "give", "some",
}

TOPIC_SUGGESTIONS = {
    "gravity":  ["Newton's Laws", "Planets", "Space"],
    "water":    ["States of Matter", "Water Cycle", "Oceans"],
    "dinosaur": ["Fossils", "Prehistoric Life", "Evolution"],
    "math":     ["Fractions", "Multiplication", "Geometry"],
    "light":    ["Colours", "Rainbows", "Optics"],
    "plant":    ["Photosynthesis", "Ecosystems", "Flowers"],
    "computer": ["Coding", "Internet", "AI"],
    "history":  ["Ancient Civilisations", "World Wars", "Freedom Fighters"],
    "human":    ["Human Body", "Organs", "Health"],
    "animal":   ["Wildlife", "Food Chain", "Habitats"],
}

def get_recommendations(user_id: int, db: DBSession) -> dict:
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user_id).all()
    topics   = [s.topic or "" for s in sessions]

    if not topics:
        return {
            "recommendations":   ["Science", "Mathematics", "History"],
            "method":            "default",
            "sessions_analysed": 0,
        }

    all_words = " ".join(topics).lower().split()
    filtered  = [w for w in all_words if w not in STOP_WORDS and len(w) > 3]
    freq      = Counter(filtered)

    smart_recommendations = []
    for word, _ in freq.most_common(20):
        for keyword, suggestions in TOPIC_SUGGESTIONS.items():
            if keyword in word or word in keyword:
                smart_recommendations.extend(suggestions)

    seen  = set()
    final = []
    for rec in smart_recommendations:
        if rec not in seen:
            seen.add(rec)
            final.append(rec)
        if len(final) == 3:
            break

    if not final:
        final = [w.capitalize() for w, _ in freq.most_common(3)]

    return {
        "recommendations":   final if final else ["Science", "Mathematics", "History"],
        "top_words":         dict(freq.most_common(5)),
        "method":            "ml_frequency_analysis",
        "sessions_analysed": len(sessions),
    }


# ─── PARENTAL CONTROLS ────────────────────────────────────────────────────────
def set_parental_controls(
    user_id:           int,
    password:          str,
    max_daily_minutes: int,
    blocked_topics:    list,
    db:                DBSession,
) -> dict:
    settings = db.query(ParentSettings).filter(ParentSettings.user_id == user_id).first()
    hashed = hashlib.sha256(password.encode()).hexdigest()

    if not settings:
        settings = ParentSettings(
            user_id           = user_id,
            max_daily_minutes = max_daily_minutes,
            blocked_topics    = json.dumps(blocked_topics),
            password_hash     = hashed,
        )
        db.add(settings)
    else:
        settings.max_daily_minutes = max_daily_minutes
        settings.blocked_topics    = json.dumps(blocked_topics)
        settings.password_hash     = hashed

    db.commit()
    return {"message": "Parental controls saved!", "max_daily_minutes": max_daily_minutes}


def verify_parental_pin(user_id: int, password: str, db: DBSession) -> bool:
    settings = db.query(ParentSettings).filter(ParentSettings.user_id == user_id).first()
    if not settings:
        return False
    return hashlib.sha256(password.encode()).hexdigest() == settings.password_hash


def is_topic_blocked(user_id: int, question: str, db: DBSession) -> bool:
    settings = db.query(ParentSettings).filter(ParentSettings.user_id == user_id).first()
    if not settings:
        return False
    blocked = json.loads(settings.blocked_topics)
    return any(topic.lower() in question.lower() for topic in blocked)