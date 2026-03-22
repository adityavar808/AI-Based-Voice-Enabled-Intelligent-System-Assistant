# ZENIX Voice Enabled Intelligent System Assistant

ZENIX is a cinematic voice-first assistant with a React frontend and a FastAPI backend. The UI handles the immersive boot sequence, speech recognition, and text-to-speech playback. The backend handles chat responses, optional authentication, and optional conversation persistence.

## Project Structure

- `src/`: React frontend built with Vite, Framer Motion, and Tailwind CSS
- `Backend/app/`: FastAPI backend for chat, auth, and service integrations
- `public/zenix_voice.mp3`: intro voice asset used during startup

## Current Behavior

- Voice boot screen and animated orb interface
- Start screen with login, register, and guest access paths
- Browser speech recognition for user voice input
- Browser speech synthesis for spoken responses
- `POST /api/chat` works in guest mode or with a bearer token
- Optional user registration and login through:
  - `POST /api/register`
  - `POST /api/login`
  - `GET /api/me`
- Authenticated history retrieval through `GET /api/history`
- Optional MongoDB persistence for users and conversations
- Optional Groq-backed model responses when `GROQ_API_KEY` is configured
- Safe in-memory fallback when MongoDB is not configured
- Mock AI reply fallback when `GROQ_API_KEY` is not configured

## Frontend Setup

```bash
npm install
npm run dev
```

Optional frontend environment variable:

```bash
VITE_API_URL=http://127.0.0.1:8000
```

If `VITE_API_URL` is not set, the frontend assumes the backend is reachable at `http://127.0.0.1:8000` through the API helpers, while some in-app fetches also support relative `/api/chat` routing if you proxy requests locally.

## Backend Setup

From the project root:

```bash
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Optional backend environment variables:

```bash
SECRET_KEY=change-me
GROQ_API_KEY=your-groq-key
MONGO_URI=mongodb://localhost:27017
```

## Notes

- Without `MONGO_URI`, the backend still starts and stores auth/chat data in memory for the running process.
- If `MONGO_URI` is configured but MongoDB is unreachable, the backend still falls back safely and reports `mongo_ready: false` on `/health`.
- Without `GROQ_API_KEY`, the backend returns mock responses so the UI remains usable.
- The frontend depends on browser support for `SpeechRecognition` or `webkitSpeechRecognition`.
- Authenticated users keep server-side chat history; guest mode keeps conversation only in the current frontend session.

## Verification

- Frontend lint: `npm run lint`
- Backend import: `python -c "import sys; sys.path.insert(0, r'Backend'); import app.main"`
- Backend smoke test: guest chat, register, and authenticated chat verified with `fastapi.testclient`
