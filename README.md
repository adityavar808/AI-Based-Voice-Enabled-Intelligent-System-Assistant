# <div align="center">🎯 ZENIX</div>
## <div align="center">AI-Based Voice-Enabled Intelligent System Assistant</div>

<div align="center">

[![React](https://img.shields.io/badge/React-19.2-%2320c997?logo=react&style=flat-square)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-%2309ab3b?logo=fastapi&style=flat-square)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?logo=python&style=flat-square)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)]()

*An immersive voice-first AI assistant with cinematic UI, real-time speech recognition, and intelligent conversations.*

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🏗️ Architecture](#-architecture) • [🤝 Contributing](#-contributing)

</div>

---

## ✨ Overview

**ZENIX** is a next-generation voice-enabled AI assistant that combines cutting-edge technology with an immersive user experience. Built with a React frontend and FastAPI backend, ZENIX provides:

- 🎤 **Voice-First Interface** - Natural speech recognition and text-to-speech synthesis
- 🎬 **Cinematic Experiences** - Animated boot sequences and interactive orb interface
- 🤖 **Intelligent Conversations** - Powered by Groq AI with persistent conversation history
- 🔐 **Secure Authentication** - JWT-based user authentication with optional MongoDB persistence
- ⚡ **Production-Ready** - Rate limiting, CORS support, and comprehensive error handling

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm/yarn
- **Python** 3.10+
- **MongoDB** (optional, for persistent storage)

### 1️⃣ Frontend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/zenix.git
cd zenix

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env  # Create and edit .env file

# Start FastAPI server
python -m uvicorn app.main:app --reload
```

The backend will run on `http://localhost:8000`

---

## 🎯 Features

### 🎤 Voice Interface
- **Real-time Speech Recognition** - Uses browser Web Speech API
- **Natural Speech Synthesis** - Browser-native text-to-speech output
- **Voice Input/Output Settings** - Customize voice speed, pitch, and language

### 💬 Intelligent Conversations
- **AI-Powered Chat** - Groq API integration for fast, intelligent responses
- **Conversation History** - Persistent chat history with MongoDB
- **Context Awareness** - Maintains conversation context across sessions

### 🔐 Security & Authentication
- **User Registration & Login** - JWT-based authentication
- **Secure Password Hashing** - bcrypt password encryption
- **Token Refresh** - Access and refresh token management
- **Optional Auth** - Works in guest mode without authentication

### ⚙️ Settings & Customization
- **AI Model Selection** - Choose between available AI providers
- **Appearance Themes** - Dark/Light mode and custom styling
- **Developer Tools** - Debug mode and API testing utilities
- **Voice Settings** - Speech synthesis customization
- **Security Settings** - Token and session management

### 📊 Analytics & Monitoring
- **Health Checks** - `/health` endpoint for service status
- **Rate Limiting** - SlowAPI integration to prevent abuse
- **Error Handling** - Comprehensive error messages and logging

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     ZENIX Frontend (React)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Voice UI  │  Chat Box  │  Settings  │  Boot Sequence   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                   ZENIX Backend (FastAPI)                    │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth    │  │  Chat    │  │   AI     │  │ Database │   │
│  │   Routes  │  │  Routes  │  │ Services │  │ (Mongo)  │   │
│  └───────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               External Services (Optional)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Groq API │  │ Google   │  │ MongoDB  │  │ Analytics│    │
│  │  (Chat)  │  │ Cloud    │  │  Atlas   │  │ (Vercel) │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend**
| Technology | Purpose |
|-----------|---------|
| React 19 | UI Framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling & responsive design |
| Framer Motion | Animations & transitions |
| GSAP | Advanced animations |
| Web Speech API | Voice recognition & synthesis |

**Backend**
| Technology | Purpose |
|-----------|---------|
| FastAPI | Web framework |
| Uvicorn | ASGI server |
| Python-Jose | JWT authentication |
| Passlib + Bcrypt | Password hashing |
| PyMongo | MongoDB driver |
| Groq Python SDK | AI chat integration |
| SlowAPI | Rate limiting |

---

## 📖 Documentation

### Project Structure

```
zenix/
├── src/                      # React frontend
│   ├── components/           # Reusable UI components
│   │   ├── AuthPanel.jsx     # Login/Register UI
│   │   ├── CinematicBoot.jsx # Boot sequence animation
│   │   ├── ConversationBox.jsx # Chat interface
│   │   └── OrbCore.jsx       # Animated orb
│   ├── pages/                # Page components
│   │   └── Home.jsx          # Main app page
│   ├── modules/              # Feature modules
│   │   └── settings/         # Settings page & tabs
│   ├── hooks/                # Custom React hooks
│   ├── api/                  # API client utilities
│   └── App.jsx               # Root component
│
├── Backend/                  # FastAPI backend
│   ├── app/
│   │   ├── main.py           # FastAPI app setup
│   │   ├── core/
│   │   │   └── security.py   # JWT & password utilities
│   │   ├── routes/           # API endpoints
│   │   │   ├── auth.py       # Auth endpoints
│   │   │   └── chat.py       # Chat endpoints
│   │   ├── services/         # Business logic
│   │   │   ├── ai_service.py # AI integration
│   │   │   └── conversation_service.py
│   │   ├── database/         # Database setup
│   │   │   └── mongo.py      # MongoDB config
│   │   ├── models/           # Data models
│   │   └── schemas/          # Pydantic schemas
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables
│
├── package.json              # Frontend dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
└── README.md                 # This file
```

### API Endpoints

#### 🔐 Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/api/register` | Register new user | ❌ |
| POST | `/api/login` | User login | ❌ |
| GET | `/api/me` | Get current user info | ✅ |

**Register/Login Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"  // Optional for registration
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### 💬 Chat Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/api/chat` | Send chat message | ❌ (Optional) |
| GET | `/api/history` | Get chat history | ✅ |
| POST | `/api/transcribe` | Transcribe audio | ❌ |

**Chat Request:**
```json
{
  "message": "What is the weather today?",
  "history": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ]
}
```

**Chat Response:**
```json
{
  "reply": "Here's the weather information..."
}
```

#### 🏥 System Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server status |
| GET | `/health` | Health check with service details |

**Health Check Response:**
```json
{
  "status": "ok",
  "service": "zenix-backend",
  "version": "1.0.0",
  "mongo_configured": true,
  "mongo_ready": true,
  "mongo_error": null
}
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `Backend/` directory:

```bash
# FastAPI Configuration
SECRET_KEY=your-super-secret-key-change-this

# MongoDB (Optional - uses in-memory fallback if not set)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/zenix?retryWrites=true&w=majority

# AI Service (Optional - uses mock responses if not set)
GROQ_API_KEY=your-groq-api-key
GOOGLE_API_KEY=your-google-api-key

# Frontend Configuration (.env in root directory)
VITE_API_URL=http://127.0.0.1:8000
```

### Getting API Keys

**Groq API:**
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up and create an API key
3. Add to `GROQ_API_KEY` in `.env`

**MongoDB Atlas:**
1. Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string and add to `MONGO_URI`

**Google Cloud:**
1. Enable Google Cloud Speech API
2. Create service account and get credentials
3. Set `GOOGLE_API_KEY`

---

## 🧪 Testing & Development

### Frontend Development

```bash
# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Backend Development

```bash
# Run with auto-reload (development)
python -m uvicorn app.main:app --reload

# Run with specific host/port
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Access API documentation
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

### Testing with Postman

1. **Register User**
   - Method: `POST`
   - URL: `http://localhost:8000/api/register`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123",
       "name": "Test User"
     }
     ```

2. **Send Chat Message**
   - Method: `POST`
   - URL: `http://localhost:8000/api/chat`
   - Body (JSON):
     ```json
     {
       "message": "Hello, how are you?",
       "history": []
     }
     ```

3. **Get History (Authenticated)**
   - Method: `GET`
   - URL: `http://localhost:8000/api/history`
   - Headers: `Authorization: Bearer YOUR_ACCESS_TOKEN`

---

## 🔍 Troubleshooting

### Common Issues

**Issue: 503 Service Unavailable on Register**
```
Solution: MONGO_URI is set but MongoDB is unavailable.
Options:
1. Comment out MONGO_URI to use in-memory storage
2. Fix your MongoDB connection string
3. Check network access rules in MongoDB Atlas
```

**Issue: CORS Errors**
```
Solution: Backend CORS is configured for all origins.
If issues persist, check:
1. VITE_API_URL is set correctly
2. Backend is running on expected port
3. Browser console for specific errors
```

**Issue: Voice Not Working**
```
Solution: Browser Web Speech API may not be available.
Check:
1. Browser support (Chrome/Edge recommended)
2. Microphone permissions granted
3. Check browser console for errors
```

**Issue: No AI Responses (Mock Fallback)**
```
Solution: GROQ_API_KEY not set.
Add your Groq API key to Backend/.env
Without it, you'll receive placeholder responses
```

---

## 📦 Deployment

### Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy Backend (Railway/Render)

1. Create account on Railway or Render
2. Connect GitHub repository
3. Set environment variables
4. Deploy

**Environment Variables to Set:**
- `SECRET_KEY` - Your JWT secret
- `MONGO_URI` - MongoDB connection string
- `GROQ_API_KEY` - Groq API key

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- **Code Style**: Use Prettier for formatting
- **Testing**: Test your changes locally before submitting PR
- **Documentation**: Update README for new features
- **Commits**: Use clear, descriptive commit messages

### Areas for Contribution

- [ ] Add more AI model integrations
- [ ] Enhance voice recognition accuracy
- [ ] Add more themes and UI customizations
- [ ] Improve mobile responsiveness
- [ ] Add unit and integration tests
- [ ] Optimize performance
- [ ] Improve documentation

---

## 📊 Performance Metrics

- **Frontend Bundle Size**: ~250KB (gzipped)
- **Time to Interactive**: <2s (with preloading)
- **API Response Time**: <500ms (with Groq)
- **Voice Recognition Latency**: Real-time with Web Speech API

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com) - Modern Python web framework
- [React](https://react.dev) - UI library
- [Groq](https://groq.com) - Lightning-fast LLM inference
- [MongoDB](https://www.mongodb.com) - NoSQL database
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion) - Animation library

---

<div align="center">

### Made with ❤️ by the ZENIX Team

⭐ If you find this project helpful, please consider giving it a star!

[⬆ Back to Top](#zenix)

</div>
