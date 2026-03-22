import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Only initialize Groq if API key exists
if GROQ_API_KEY:
    from groq import Groq
    client = Groq(api_key=GROQ_API_KEY)
else:
    client = None

GOOGLE_CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Only initialize Google Speech if credentials exist
if GOOGLE_CREDENTIALS_PATH and os.path.exists(GOOGLE_CREDENTIALS_PATH):
    from google.cloud import speech
    speech_client = speech.SpeechClient()
else:
    speech_client = None


ZENIX_SYSTEM_PROMPT = """You are Zenix, an advanced AI voice assistant. You are:
Concise and direct because responses are spoken aloud.
Intelligent and capable and able to help with tasks and conversations.
Calm and composed and speak with quiet confidence.
Context aware and remember what was said earlier in the conversation.

Important rules for voice output:
Never use markdown or formatting symbols.
Never say things like as an AI language model.
Speak naturally as if talking to a person.
If you don't know something say so briefly.
Keep responses conversational and easy to listen to."""


def get_ai_response(message: str, history: list = None) -> str:

    # If API key missing return mock response
    if client is None:
        return f"Zenix mock response: You said {message}"

    messages = [{"role": "system", "content": ZENIX_SYSTEM_PROMPT}]

    if history:
        for turn in history[-10:]:
            role = turn.get("role")
            content = turn.get("content", "").strip()

            if role in ("user", "assistant") and content:
                messages.append({
                    "role": role,
                    "content": content
                })

    messages.append({
        "role": "user",
        "content": message
    })

    chat_completion = client.chat.completions.create(
        messages=messages,
        model="llama-3.1-8b-instant",
        temperature=0.7,
        max_tokens=256
    )

    return chat_completion.choices[0].message.content.strip()


def transcribe_audio(audio_bytes: bytes) -> str:
    if speech_client is None:
        return "Google Cloud credentials not configured"
    
    from google.cloud import speech
    
    audio = speech.RecognitionAudio(content=audio_bytes)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sample_rate_hertz=48000,  # Adjust based on MediaRecorder settings
        language_code="en-US",
    )
    
    try:
        response = speech_client.recognize(config=config, audio=audio)
        if response.results:
            return response.results[0].alternatives[0].transcript
        else:
            return "No speech detected"
    except Exception as e:
        return f"Transcription failed: {str(e)}"