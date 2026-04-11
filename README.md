<div align="center">
<pre style="background:transparent; border:none; box-shadow:none;">
███████╗  ███████╗  ███╗   ██╗  ██╗  ██╗  ██╗ 
╚══███╔╝  ██╔════╝  ████╗  ██║  ██║  ╚██╗██╔╝ 
  ███╔╝   █████╗    ██╔██╗ ██║  ██║   ╚███╔╝  
 ███╔╝    ██╔══╝    ██║╚██╗██║  ██║   ██╔██╗  
███████╗  ███████╗  ██║ ╚████║  ██║  ██╔╝ ██╗ 
╚══════╝  ╚══════╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝  ╚═╝ 
</pre>
</div>

<div align="center">AI-Based Voice-Enabled Intelligent System Assistant</div>

<div align="center">

[![React](https://img.shields.io/badge/React-19.2-%2320c997?logo=react&style=flat-square)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-%2309ab3b?logo=fastapi&style=flat-square)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?logo=python&style=flat-square)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)]()

*An immersive voice-first AI assistant with cinematic UI, real-time speech recognition, and intelligent conversations.*

<p align="center">
  <a href="#-quick-start"><img src="https://img.shields.io/badge/🚀%20Quick%20Start-blue?style=for-the-badge"></a>
  <a href="#-documentation"><img src="https://img.shields.io/badge/📖%20Documentation-green?style=for-the-badge"></a>
  <a href="#-architecture"><img src="https://img.shields.io/badge/🏗️%20Architecture-orange?style=for-the-badge"></a>
  <a href="#-contributing"><img src="https://img.shields.io/badge/🤝%20Contributing-purple?style=for-the-badge"></a>
</p>

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
│                     ZENIX Frontend (React)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Voice UI  │  Chat Box  │  Settings  │  Boot Sequence │  |
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓ (HTTP/REST)
┌─────────────────────────────────────────────────────────────┐
│                   ZENIX Backend (FastAPI)                   │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth    │  │  Chat    │  │   AI     │  │ Database │    │
│  │  Routes   │  │  Routes  │  │ Services │  │ (Mongo)  │    │
│  └───────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               External Services (Optional)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐    │
│  │ Groq API │  │ Google   │  │ MongoDB  │  │ Analytics │    │
│  │  (Chat)  │  │ Cloud    │  │  Atlas   │  │ (Vercel)  │    │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘    │
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

## 👨‍🚀 Meet the Team

<div align="center">

<table>
<tr>

<td align="center">
<img src="https://github.com/yourusername.png" width="110px;" style="border-radius:50%" />
<br />
<h3>Aditya Varshney</h3>
<p>🧠 AI Engineer & Full Stack Developer</p>
<p><sub>GenAI • System Design • Frontend • Backend • AI Integration</sub></p>
</td>

<td align="center">
<img src="https://github.com/yourusername2.png" width="110px;" style="border-radius:50%" />
<br />
<h3>Alok</h3>
<p>🚀 Full Stack Developer</p>
<p><sub>Frontend • Backend • API Integration • Authentication</sub></p>
</td>

<td align="center">
<img src="https://github.com/yourusername3.png" width="110px;" style="border-radius:50%" />
<br />
<h3>Krishna Tanwar</h3>
<p>💻 Full Stack Developer</p>
<p><sub>Frontend • Backend</sub></p>
</td>

</tr>
</table>

</div>
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
