from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── Zenix system prompt ────────────────────────────────────────────────────────
ZENIX_SYSTEM_PROMPT = """You are Zenix, an advanced AI voice assistant. You are:
- Concise and direct — your responses are spoken aloud, so keep them under 3 sentences unless the user explicitly asks for detail
- Intelligent and capable — you can answer questions, set reminders, help with tasks, and hold natural conversations
- Calm and composed — you speak with quiet confidence, not hype
- Context-aware — you remember what was said earlier in this conversation

Important rules for voice output:
- Never use markdown, bullet points, asterisks, or any formatting symbols
- Never say things like "As an AI language model" or refer to your limitations
- Speak naturally as if talking to a person, not writing an essay
- If you don't know something, say so briefly and move on
- Keep responses conversational and easy to listen to"""


def get_ai_response(message: str, history: list = None) -> str:
    """
    Get a response from the Groq LLM.

    Args:
        message:  The latest user message.
        history:  Optional list of previous turns, each a dict with
                  {"role": "user"|"assistant", "content": str}.
                  This is used to maintain conversation context.

    Returns:
        The assistant's reply as a plain string.
    """

    messages = [{"role": "system", "content": ZENIX_SYSTEM_PROMPT}]

    # Append conversation history (cap at last 10 turns to stay within token limits)
    if history:
        for turn in history[-10:]:
            role = turn.get("role")
            content = turn.get("content", "").strip()
            if role in ("user", "assistant") and content:
                messages.append({"role": role, "content": content})

    # Append the current user message
    messages.append({"role": "user", "content": message})

    chat_completion = client.chat.completions.create(
        messages=messages,
        model="llama-3.1-8b-instant",
        temperature=0.7,        # Slightly creative but still grounded
        max_tokens=256,         # Keep responses short — they are spoken aloud
    )

    return chat_completion.choices[0].message.content.strip()
