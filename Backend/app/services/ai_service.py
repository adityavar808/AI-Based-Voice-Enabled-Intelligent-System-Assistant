from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_ai_response(message: str):

    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "user", "content": message}
        ],
        model="llama-3.1-8b-instant"
    )

    return chat_completion.choices[0].message.content