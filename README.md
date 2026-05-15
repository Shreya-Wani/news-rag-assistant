# 🧠 NewsMind AI

> AI-powered News RAG Chatbot — Ask questions about current events and get intelligent, source-backed answers.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Stack](https://img.shields.io/badge/stack-MERN%20%2B%20GenAI-blueviolet)
![License](https://img.shields.io/badge/license-ISC-green)
![GitHub repo](https://img.shields.io/badge/GitHub-NewsMind--AI-181717?logo=github)

---

## 📋 Overview

**NewsMind AI** is a full-stack AI-powered news assistant that uses **Retrieval-Augmented Generation (RAG)** to answer user questions about current events. It ingests and indexes real news articles, stores them as vector embeddings in Pinecone, and uses Google Gemini LLM via LangChain to generate accurate, context-aware responses — with source citations from the original articles.

### ✨ Key Features

- 💬 **Conversational AI Chat** — Natural-language questions answered with source citations
- 📰 **News Article Browser** — View all indexed articles in a clean dashboard
- 🧠 **RAG Pipeline** — LangChain + HuggingFace embeddings + Pinecone vector search + Gemini LLM
- 🔍 **Analyze with AI** — Deep-dive analysis on any AI response (insights, summary, follow-ups)
- ⚡ **Fast Semantic Retrieval** — `sentence-transformers/all-MiniLM-L6-v2` embeddings, 384-dim
- 🎨 **Minimalist Dark UI** — True-black design with Inter font and glassmorphism

---

## 🛠️ Tech Stack

| Layer       | Technology                                          |
|-------------|-----------------------------------------------------|
| Frontend    | React 19 + Vite, Tailwind CSS, Axios                |
| Backend     | Node.js, Express.js, Nodemon                        |
| Database    | MongoDB Atlas (Mongoose ODM)                        |
| Embeddings  | HuggingFace Inference API (`all-MiniLM-L6-v2`)      |
| LLM         | Google Gemini (`gemini-1.5-flash`) via LangChain JS |
| Vector DB   | Pinecone (Serverless)                               |
| RAG Engine  | LangChain.js                                        |
| Dev Tools   | Nodemon, ESLint                                     |

---

## 📁 Project Structure

```
newsmind-ai/
├── client/                     # React Frontend (Vite)
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── chat/           # ChatMessage, SourceCard, LoadingDots
│       │   ├── layout/         # Navbar, Footer, Layout
│       │   └── ui/             # Button, Loader
│       ├── pages/              # HomePage, ChatPage, NewsPage, NotFoundPage
│       ├── services/           # Axios API services (chat, news)
│       ├── utils/              # Constants & helpers
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css           # Global styles + design tokens
│
├── server/                     # Express Backend
│   ├── data/
│   │   └── sample-dataset.json # Sample news articles for ingestion
│   └── src/
│       ├── config/             # DB, CORS, Pinecone, constants, prompts
│       ├── controllers/        # chat, news, ingest, analysis
│       ├── middlewares/        # Error handler, rate limiter, validator
│       ├── models/             # NewsArticle, Chat (Mongoose schemas)
│       ├── routes/             # API route definitions
│       ├── services/           # RAG pipeline, embedding, retrieval, chunking
│       ├── utils/              # ApiError, ApiResponse, logger, asyncHandler
│       ├── app.js              # Express app setup & middleware
│       └── server.js           # Entry point (DB connect + listen)
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB Atlas** account (free tier works)
- **Pinecone** account & API key
- **Google AI Studio** (Gemini) API key
- **HuggingFace** account & API token

### 1. Clone the Repository

```bash
git clone https://github.com/ShivamPatel145/Newsmind-AI.git
cd Newsmind-AI
```

### 2. Setup Backend

```bash
cd server
cp .env.example .env    # Fill in your credentials (see table below)
npm install --legacy-peer-deps
npm run dev             # Starts on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd client
cp .env.example .env
npm install --legacy-peer-deps
npm run dev             # Starts on http://localhost:5173
```

### 4. Ingest News Data

Once both servers are running, trigger the ingestion pipeline to index the sample articles:

```bash
curl -X POST http://localhost:5000/api/v1/ingest
```

Or open the app and use the built-in ingest button.

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

| Variable               | Description                                      | Where to get it |
|------------------------|--------------------------------------------------|-----------------|
| `NODE_ENV`             | `development` or `production`                    | —               |
| `PORT`                 | Server port (default: `5000`)                    | —               |
| `MONGODB_URI`          | MongoDB Atlas connection string                  | [MongoDB Atlas](https://cloud.mongodb.com) |
| `GEMINI_API_KEY`       | Google Gemini API key                            | [Google AI Studio](https://aistudio.google.com) |
| `HUGGINGFACE_API_KEY`  | HuggingFace token (for embeddings)               | [HuggingFace Tokens](https://huggingface.co/settings/tokens) |
| `PINECONE_API_KEY`     | Pinecone API key                                 | [Pinecone Console](https://app.pinecone.io) |
| `PINECONE_INDEX`       | Pinecone index name (e.g. `newsmind-ai`)         | Create in Pinecone dashboard |
| `PINECONE_HOST`        | Pinecone index host URL                          | Shown in Pinecone dashboard |
| `PINECONE_ENVIRONMENT` | Pinecone region (e.g. `us-east-1`)               | Shown in Pinecone dashboard |
| `CLIENT_URL`           | Frontend URL for CORS (default: `http://localhost:5173`) | — |
| `JWT_SECRET`           | Secret for JWT signing                           | Any random string |

> **Pinecone Index Setup:** Create a Serverless index named `newsmind-ai` with **384 dimensions** and **Cosine** metric (matches `all-MiniLM-L6-v2`).

### Frontend (`client/.env`)

| Variable        | Description                       |
|-----------------|-----------------------------------|
| `VITE_API_URL`  | Backend API base URL              |
| `VITE_APP_NAME` | App display name                  |

---

## 📡 API Endpoints

| Method   | Endpoint                              | Description                          |
|----------|---------------------------------------|--------------------------------------|
| `GET`    | `/api/v1/health`                      | Server health check                  |
| `POST`   | `/api/v1/chat/message`                | Send a question to the RAG chatbot   |
| `GET`    | `/api/v1/chat/history/:sessionId`     | Get chat history for a session       |
| `POST`   | `/api/v1/chat/session`                | Create a new chat session            |
| `DELETE` | `/api/v1/chat/session/:sessionId`     | Delete a chat session                |
| `GET`    | `/api/v1/news`                        | Get all indexed articles (paginated) |
| `GET`    | `/api/v1/news/search`                 | Semantic article search              |
| `GET`    | `/api/v1/news/:id`                    | Get a single article by ID           |
| `POST`   | `/api/v1/ingest`                      | Trigger news ingestion pipeline      |
| `POST`   | `/api/v1/analyze`                     | Deep AI analysis of a response       |

---

## 🏗️ Architecture

```
User Query
    │
    ▼
React Frontend (Vite)
    │  Axios /api/v1/chat/message
    ▼
Express Backend (Node.js)
    │
    ├── Middleware (CORS, Helmet, Rate Limiter, Validator)
    │
    ▼
RAG Pipeline (LangChain.js)
    │
    ├── 1. Embed Query ──► HuggingFace Inference API
    │                       (sentence-transformers/all-MiniLM-L6-v2)
    │
    ├── 2. Vector Search ─► Pinecone (Serverless)
    │                        Returns top-k relevant chunks
    │
    ├── 3. Build Prompt ──► promptTemplates.js
    │                        (Injects retrieved context)
    │
    └── 4. Generate Answer ► Google Gemini (gemini-1.5-flash)
                              Returns answer + source citations
    │
    ▼
MongoDB Atlas
    └── Stores: Articles, Chunks, Chat History
```

---

## 🧩 RAG Pipeline Detail

1. **Ingestion** — Sample articles from `data/sample-dataset.json` are chunked into overlapping segments by `chunking.service.js`
2. **Embedding** — Each chunk is embedded using HuggingFace's `all-MiniLM-L6-v2` (384 dims)
3. **Indexing** — Embeddings + metadata are upserted to Pinecone via `vectorStore.service.js`
4. **Retrieval** — User query is embedded, then top-k chunks retrieved from Pinecone
5. **Generation** — Retrieved chunks injected into a prompt template → Gemini generates the final answer

---

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  Built with ❤️ using <strong>MERN + LangChain + Gemini AI + Pinecone</strong>
</p>
