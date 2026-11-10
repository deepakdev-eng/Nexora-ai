# 🚀 NexoraAI – AI-Powered Chatbot

NexoraAI is an AI-powered conversational chatbot built using the MERN stack and Groq API. It provides intelligent responses through a Large Language Model (LLM), with real-time streaming and persistent conversation history.

## ✨ Features

- 🤖 AI-powered conversations using Groq API
- 🧠 LLM integration with GPT-OSS 20B
- ⚡ Real-time streaming responses using Server-Sent Events (SSE)
- 💬 Interactive and responsive chat interface
- 🗂️ Create and manage multiple conversations
- 💾 Persistent chat history using MongoDB
- 📝 Markdown rendering for AI responses
- 💻 Syntax highlighting for code snippets
- 🗑️ Delete previous conversations
- 🎨 Custom NexoraAI branding and interface

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript (ES6+)
- CSS
- React Markdown
- Remark GFM
- Highlight.js integration

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- REST APIs

### AI Integration
- Groq API
- Large Language Model (LLM)
- GPT-OSS 20B
- Server-Sent Events (SSE)

## 🏗️ Project Architecture

```text
Nexora-ai/
│
├── backend/
│   ├── models/
│   │   └── Thread.js
│   ├── routes/
│   │   └── chats.js
│   ├── utils/
│   │   └── openai.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── Frontend/
│   ├── public/
│   │   └── NexoraAI.png
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Chat.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MyContext.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
│
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Nexora-ai
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
```

Start the backend:

```bash
node server.js
```

Backend runs at:

```text
http://localhost:8080
```

### 3. Frontend Setup

Open another terminal:

```bash
cd Frontend
npm install
npm run dev
```

Open the local URL provided by Vite.

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| MONGODB_URI | MongoDB connection string |
| GROQ_API_KEY | Groq API key |
| GROQ_MODEL | LLM model identifier |

Keep your environment variables private. Never commit `.env` files or API keys to GitHub.

## 🔄 How It Works

1. User enters a message in the React chat interface.
2. Frontend sends the message to the Express backend.
3. Backend communicates with the Groq API.
4. The LLM generates a response.
5. Backend streams the response using SSE.
6. React displays the generated response in real time.
7. Conversations are stored in MongoDB.

## 🗺️ Future Improvements

- Retrieval-Augmented Generation (RAG)
- PDF and document uploads
- Resume analysis and question answering
- Vector database integration
- User authentication and authorization
- Voice input and output
- Improved conversational memory
- Production deployment

## 👨‍💻 Developer

**Deepak Kumar Singh**

Full Stack MERN Developer

Passionate about building modern web applications and AI-powered solutions.

## 🚧 Project Status & Continuous Development

NexoraAI is an actively developing project. I am continuously working on improving its functionality, user experience, and AI capabilities.

New features, enhancements, bug fixes, and improvements will be added to this project over time.

**Development goals:**
- Continuously introduce new AI features.
- Improve chatbot performance and response quality.
- Expand document processing and RAG capabilities.
- Enhance UI/UX and responsiveness.
- Optimize backend architecture and performance.

Stay tuned for upcoming updates!

## 👨‍💻 Developer

**Deepak Kumar Singh**

Full Stack MERN Developer

Passionate about building modern web applications and AI-powered solutions.

## ⭐ Support

If you like this project, consider giving it a star on GitHub!

---

**Built with ❤️ by Deepak Kumar Singh**

*More features and improvements coming soon! 🚀*
