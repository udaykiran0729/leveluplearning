from gtts import gTTS
from groq import Groq
import base64, os, io
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

VOICE_STYLES = {
    "doraemon":     "Speak like Doraemon — cheerful, helpful, curious friend! Use 'Nobita!' sometimes.",
    "chhota_bheem": "Speak like Chhota Bheem — brave, simple, enthusiastic! Use 'Jai Shri Krishna!' sometimes.",
    "dora":         "Speak like Dora the Explorer — energetic, encouraging! Say 'Excellent!' and 'Vamonos!'",
    "spiderman":    "Speak like Spider-Man — cool, witty! Use 'Your friendly neighborhood Spider-Man says...'",
}

LANG_CODE = {
    "english": "en",
    "hindi":   "hi",
}


def generate_character_response(
    question:  str,
    character: str = "doraemon",
    language:  str = "english",
) -> dict:

    character_style  = VOICE_STYLES.get(character, VOICE_STYLES["doraemon"])
    lang_instruction = "Reply only in Hindi." if language == "hindi" else "Reply only in English."

    system_prompt = f"""
    You are a fun educational assistant for children aged 6 to 14.
    {character_style}
    {lang_instruction}
    Keep your answer under 4 sentences.
    Always end with one encouraging sentence.
    Use simple words a child can understand.
    """

    # Step 1: Get AI text response
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": question},
        ],
        max_tokens=200,
    )
    answer_text = response.choices[0].message.content

    # Step 2: Convert text to speech using gTTS
    lang      = LANG_CODE.get(language, "en")
    tts       = gTTS(text=answer_text, lang=lang, slow=False)
    audio_buf = io.BytesIO()
    tts.write_to_fp(audio_buf)
    audio_buf.seek(0)

    # Step 3: Convert audio to base64 to send to frontend
    audio_base64 = base64.b64encode(audio_buf.read()).decode("utf-8")

    return {
        "answer":      answer_text,
        "audio_base64": audio_base64,
        "character":   character,
        "language":    language,
    }