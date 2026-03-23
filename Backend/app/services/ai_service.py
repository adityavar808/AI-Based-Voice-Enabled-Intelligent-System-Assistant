import os
import re

from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GOOGLE_CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
GROQ_PRIMARY_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
_fallback_models_raw = os.getenv("GROQ_FALLBACK_MODELS", "llama-3.1-8b-instant")
GROQ_FALLBACK_MODELS = [model.strip() for model in _fallback_models_raw.split(",") if model.strip()]
GROQ_TEMPERATURE = float(os.getenv("GROQ_TEMPERATURE", "0.6"))
GROQ_MAX_TOKENS = int(os.getenv("GROQ_MAX_TOKENS", "320"))

if GROQ_API_KEY:
    from groq import Groq

    client = Groq(api_key=GROQ_API_KEY)
else:
    client = None

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

GROQ_QUALITY_GUARD = (
    "Give a direct and useful answer to the user's exact question. "
    "Do not give generic filler lines. If the request is unclear, ask one short clarifying question."
)


def _sanitize_history(history):
    sanitized = []

    for entry in history or []:
        role = entry.get("role")
        content = entry.get("content")

        if role in {"user", "assistant", "system"} and isinstance(content, str):
            sanitized.append({"role": role, "content": content})

    return sanitized[-12:]


def _normalize(text: str):
    return re.sub(r"\s+", " ", text.strip().lower())


def _looks_like_hinglish(text: str):
    tokens = set(re.findall(r"[a-zA-Z]+", text.lower()))
    common_hinglish = {
        "gadi",
        "gaadi",
        "wala",
        "kya",
        "kaise",
        "kyu",
        "acha",
        "accha",
        "bhai",
        "bhaiya",
        "chahiye",
        "help",
        "batao",
        "samjhao",
    }
    return bool(tokens & common_hinglish)


def _last_user_messages(conversation):
    return [
        entry["content"]
        for entry in conversation
        if entry.get("role") == "user" and entry.get("content")
    ][-3:]


def _extract_groq_text(chat_completion) -> str:
    try:
        choice = chat_completion.choices[0]
        message = getattr(choice, "message", None)
        content = getattr(message, "content", "")
        return content.strip() if isinstance(content, str) else ""
    except Exception:
        return ""


def _is_weak_response(text: str) -> bool:
    normalized = _normalize(text)
    if not normalized:
        return True

    weak_patterns = [
        "i can help with explanations",
        "ask a specific question",
        "share your expected output",
        "i am running in local assistant mode",
        "i am in local assistant mode",
    ]
    if any(pattern in normalized for pattern in weak_patterns):
        return True

    return len(normalized) < 12


def _build_groq_messages(message: str, conversation):
    messages = [{"role": "system", "content": ZENIX_SYSTEM_PROMPT}]
    messages.append({"role": "system", "content": GROQ_QUALITY_GUARD})

    if _looks_like_hinglish(message):
        messages.append(
            {
                "role": "system",
                "content": "User may be speaking in Hinglish. Respond naturally in simple Hinglish.",
            }
        )

    messages.extend(conversation)
    messages.append({"role": "user", "content": message})
    return messages


def _local_fallback_response(message: str, history):
    normalized = _normalize(message)
    raw_message = message.strip()
    recent_user_messages = _last_user_messages(history)
    recent_topic = recent_user_messages[-1] if recent_user_messages else None

    if re.search(r"\b(hello|hi|hey|good morning|good evening)\b", normalized):
        return (
            "Hello. I am Zenix. I can help with general questions, explain ideas, "
            "and assist with your project even when cloud AI is not configured."
        )

    if "what are you doing" in normalized or "what do you do" in normalized:
        return (
            "Right now I am responding in local assistant mode. I can explain "
            "concepts, help with coding questions, summarize ideas, and guide you "
            "through the Zenix project flow."
        )

    if "who are you" in normalized or "what are you" in normalized:
        return (
            "I am Zenix, your voice-enabled assistant interface. I can chat, help "
            "with project tasks, explain technical topics, and keep conversation "
            "history when your backend storage is available."
        )

    if "what is ai" in normalized or "what is artificial intelligence" in normalized:
        return (
            "Artificial intelligence is the field of building systems that can "
            "perform tasks that normally require human intelligence, such as "
            "understanding language, recognizing patterns, making predictions, "
            "and assisting with decisions."
        )

    if "what is machine learning" in normalized:
        return (
            "Machine learning is a branch of AI where systems learn patterns from "
            "data instead of being programmed with every rule explicitly."
        )

    if "what is python" in normalized:
        return (
            "Python is a high-level programming language known for readable syntax "
            "and strong support for automation, web development, data work, and AI."
        )

    if "what is react" in normalized:
        return (
            "React is a JavaScript library for building user interfaces from reusable "
            "components. It is commonly used for interactive single-page applications."
        )

    if "what is api" in normalized or "what is an api" in normalized:
        return (
            "An API, or application programming interface, is a defined way for "
            "software systems to communicate with each other through requests and responses."
        )

    if normalized.startswith("what is "):
        topic = message.strip()[8:].strip(" ?.!")
        if topic:
            return (
                f"{topic} is best understood by looking at what it is, why it is used, "
                f"and one practical example. If you want, I can explain {topic} in simple terms "
                "or in a technical way."
            )

    if normalized.startswith("how to ") or normalized.startswith("how do i "):
        action = message.strip().strip(" ?.!")
        return (
            f"To help with '{action}', I can give you step-by-step instructions. "
            "Tell me your stack or context and I will provide exact steps."
        )

    if re.search(r"\b(gadi|gaadi|car|bike|vehicle)\b", normalized):
        return (
            "Agar aap vehicle related help chahte ho, main assist kar sakta hoon. "
            "Aap batao: 1) buy karni hai, 2) sell karni hai, 3) service/repair issue hai, "
            "ya 4) document/insurance help chahiye."
        )

    if normalized.startswith("explain "):
        topic = message.strip()[8:].strip(" ?.!")
        if topic:
            return (
                f"{topic} can be understood by breaking it into purpose, components, "
                f"and behavior. If you want, ask a narrower question about {topic} "
                "and I will explain it step by step."
            )

    if recent_topic and re.search(r"\b(that|it|this)\b", normalized):
        return (
            f"You seem to be referring to '{recent_topic}'. Ask one more specific "
            "question about it and I can give a clearer answer."
        )

    if len(normalized.split()) <= 3:
        if _looks_like_hinglish(raw_message):
            return (
                f"Mujhe '{raw_message}' mila. Thoda context do taaki main exact help kar paun. "
                "Example: price range, city, aur aapko kya chahiye."
            )
        return (
            f"I got '{raw_message}'. Please add one line of context so I can give a useful answer "
            "instead of a generic one."
        )

    if normalized.endswith("?"):
        return (
            f"You asked: '{raw_message}'. I am in local assistant mode right now, "
            "so I may be brief. I can still help if you share one more detail about your goal "
            "or project context."
        )

    return (
        f"I received: '{raw_message}'. I am running in local assistant mode, but I can still "
        "help with coding, explanations, and project guidance. Share your expected output and I will answer directly."
    )


def get_ai_response(message: str, history=None):
    conversation = _sanitize_history(history)

    if client is None:
        return _local_fallback_response(message, conversation)

    messages = _build_groq_messages(message, conversation)
    model_candidates = [GROQ_PRIMARY_MODEL, *GROQ_FALLBACK_MODELS]
    seen_models = set()
    errors = []

    for model_name in model_candidates:
        if model_name in seen_models:
            continue
        seen_models.add(model_name)

        try:
            chat_completion = client.chat.completions.create(
                messages=messages,
                model=model_name,
                temperature=GROQ_TEMPERATURE,
                max_tokens=GROQ_MAX_TOKENS,
            )
            response_text = _extract_groq_text(chat_completion)
            if not _is_weak_response(response_text):
                return response_text
            errors.append(f"{model_name}: weak_response")
        except Exception as exc:
            errors.append(f"{model_name}: {exc}")

    if errors:
        print("Groq request failed across models:", " | ".join(errors))
    return _local_fallback_response(message, conversation)


def transcribe_audio(audio_bytes: bytes) -> str:
    if speech_client is None:
        return "Google Cloud credentials not configured"

    from google.cloud import speech

    audio = speech.RecognitionAudio(content=audio_bytes)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sample_rate_hertz=48000,
        language_code="en-US",
    )

    try:
        response = speech_client.recognize(config=config, audio=audio)
        if response.results:
            return response.results[0].alternatives[0].transcript
        return "No speech detected"
    except Exception as exc:
        return f"Transcription failed: {str(exc)}"
