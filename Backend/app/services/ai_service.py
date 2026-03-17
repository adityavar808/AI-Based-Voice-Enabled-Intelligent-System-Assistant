import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def get_ai_response(message: str, history=None):

    # ✅ fallback (NO API required)
    if not GROQ_API_KEY:
        return f"Zenix (mock): You said '{message}'"

    try:
        from groq import Groq

        client = Groq(api_key=GROQ_API_KEY)

        messages = [{"role": "user", "content": message}]

        response = client.chat.completions.create(
            messages=messages,
            model="llama-3.1-8b-instant"
        )

        return response.choices[0].message.content

    except Exception:
        return "AI temporarily unavailable"