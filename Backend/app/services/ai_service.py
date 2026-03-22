import os
import re

from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


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


def _last_user_messages(conversation):
    return [
        entry["content"]
        for entry in conversation
        if entry.get("role") == "user" and entry.get("content")
    ][-3:]


def _local_fallback_response(message: str, history):
    normalized = _normalize(message)
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

    if normalized.endswith("?"):
        return (
            "I can still help in local mode, but I need a more specific question to "
            "give a strong answer. Ask about AI, coding, React, Python, APIs, or your Zenix project."
        )

    return (
        "I can help with explanations, coding guidance, and project questions. "
        "Ask a specific question and I will answer directly."
    )


def get_ai_response(message: str, history=None):
    conversation = _sanitize_history(history)

    if not GROQ_API_KEY:
        return _local_fallback_response(message, conversation)

    try:
        from groq import Groq

        client = Groq(api_key=GROQ_API_KEY)
        messages = conversation + [{"role": "user", "content": message}]

        response = client.chat.completions.create(
            messages=messages,
            model="llama-3.1-8b-instant",
        )

        return response.choices[0].message.content
    except Exception as exc:
        print(f"Groq request failed: {exc}")
        return "AI temporarily unavailable"
