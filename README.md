# 🧠 NewsMind AI

> AI-powered News RAG Chatbot — Ask questions about current events and get intelligent, source-backed answers.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Stack](https://img.shields.io/badge/stack-MERN%20%2B%20GenAI-blueviolet)
![License](https://img.shields.io/badge/license-ISC-green)

---

## 📋 Overview

**NewsMind AI** is a full-stack AI-powered news assistant that uses **Retrieval-Augmented Generation (RAG)** to answer user questions about current events. It fetches and indexes real-time news articles, stores them as vector embeddings, and uses a large language model to generate accurate, context-aware responses with source citations.

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React + Vite, Tailwind CSS, Axios   |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB (Mongoose)                  |
| AI / LLM    | Google Gemini API via LangChain JS  |
| Vector DB   | Pinecone                            |
| Dev Tools   | Nodemon, ESLint                     |

---

## 📁 Project Structure

```
newsmind-ai/
├── client/                     # React Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── layout/         # Layout (Navbar, Footer, Layout)
│   │   │   └── ui/             # UI primitives (Button, Loader)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer (Axios)
│   │   ├── utils/              # Helper functions & constants
│   │   ├── App.jsx             # Root component with routes
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles + Tailwind
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express Backend
│   ├── src/
│   │   ├── config/             # DB, CORS, Pinecone, constants
│   │   ├── controllers/        # Route handler logic
│   │   ├── middlewares/        # Error handling, rate limiting, validation
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic & AI services
│   │   ├── utils/              # ApiError, ApiResponse, logger
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Entry point
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Pinecone** account & API key
- **Google AI** (Gemini) API key

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/newsmind-ai.git
cd newsmind-ai
```

### 2. Setup Backend

```bash
cd server
cp .env.example .env       # Fill in your environment variables
npm install
npm run dev                 # Starts server on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev                 # Starts client on http://localhost:5173
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

| Variable              | Description                        |
|-----------------------|------------------------------------|
| `NODE_ENV`            | `development` or `production`      |
| `PORT`                | Server port (default: 5000)        |
| `MONGODB_URI`         | MongoDB connection string          |
| `GEMINI_API_KEY`      | Google Gemini API key              |
| `PINECONE_API_KEY`    | Pinecone API key                   |
| `PINECONE_INDEX`      | Pinecone index name                |
| `PINECONE_ENVIRONMENT`| Pinecone environment               |
| `CLIENT_URL`          | Frontend URL for CORS              |
| `JWT_SECRET`          | JWT secret for auth (future)       |

### Frontend (`client/.env`)

| Variable          | Description                   |
|-------------------|-------------------------------|
| `VITE_API_URL`    | Backend API base URL          |
| `VITE_APP_NAME`   | Application display name      |

---

## 📡 API Endpoints

| Method   | Endpoint                        | Description                 |
|----------|---------------------------------|-----------------------------|
| `GET`    | `/api/v1/health`                | Server health check         |
| `POST`   | `/api/v1/chat/message`          | Send message to AI chatbot  |
| `GET`    | `/api/v1/chat/history/:sessionId` | Get chat history          |
| `POST`   | `/api/v1/chat/session`          | Create new chat session     |
| `DELETE` | `/api/v1/chat/session/:sessionId` | Delete a chat session     |
| `GET`    | `/api/v1/news`                  | Get paginated articles      |
| `GET`    | `/api/v1/news/search`           | Semantic article search     |
| `GET`    | `/api/v1/news/:id`              | Get single article          |
| `POST`   | `/api/v1/news/ingest`           | Trigger article ingestion   |

---

## 🏗️ Architecture

```
User → React Frontend → Axios → Express API → LangChain RAG Pipeline
                                                    ├── Gemini LLM
                                                    ├── Pinecone (Vector Search)
                                                    └── MongoDB (Article Storage)
```

---

## 📝 Development Notes

- **No business logic is implemented yet** — this is the project foundation and architecture only
- All controllers return placeholder responses
- AI service files contain commented-out initialization code ready to be activated
- The frontend has skeleton UI pages ready for implementation

---

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  Built with ❤️ using <strong>MERN + Generative AI</strong>
</p>
