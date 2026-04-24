# BeatConnect: The Ultimate Artist Management & Fan Engagement Platform

BeatConnect is an integrated ecosystem designed to bridge the gap between music legends and their fans, while providing artists with a high-fidelity "Command Center" to manage their careers.

## 🌟 Project Overview

BeatConnect consists of multiple specialized components that work together to provide a seamless experience for artists, managers, and fans.

- **BeatConnect Mobile (Command Center)**: A premium mobile application for artists and managers.
- **BeatBot (AI Chat Service)**: A RAG-powered intelligent concierge for fan interaction.
- **Admin Portal**: A centralized dashboard for managing artists, knowledge bases, and system settings.
- **AI Backend**: A microservices-based infrastructure powering the entire ecosystem.

---

## 🏗 Architecture & Components

### 1. BeatConnect Mobile (Command Center)
The mobile app is designed as a "Command Center" for artists. It synthesizes career-critical data into a cohesive, professional-grade interface.
- **Tech Stack**: React Native (Expo), Redux, NativeWind (Tailwind CSS).
- **Key Features**:
  - **Real-time Metrics**: Streaming data and fan engagement analytics.
  - **Financial Performance**: Revenue tracking and financial insights.
  - **Legal & Docs**: Management of contracts and legal documents.
  - **Tour Logistics**: Coordination of tour dates, venues, and logistics.
  - **Team Collab**: Communication tools for artists and their management teams.

### 2. BeatBot & AI Backend
The intelligence layer of BeatConnect, providing a witty and knowledgeable AI assistant.
- **Tech Stack**: Node.js, Express, Ollama (Llama 3.2), MySQL.
- **RAG Implementation**:
  - Uses **Retrieval-Augmented Generation (RAG)** to provide grounded, accurate responses.
  - **Vector Search**: Embeddings are generated using `llama3.2` and stored in a vector index.
  - **Knowledge Sources**: Indexes `knowledge_items`, `artists` bios, and `daily_reports`.
  - **Fallback Mechanism**: Implements a naive SQL search as a fallback if semantic search yields low confidence scores.

### 3. AI Admin Portal
A sophisticated web-based management system for platform administrators.
- **Tech Stack**: React, Vite, Tailwind CSS.
- **Key Features**:
  - **Artist Management**: Add, edit, and manage artist profiles and bios.
  - **System Telemetry**: Real-time monitoring of system status and auth levels.
  - **Knowledge Base Management**: Tools to update and refine the data used by BeatBot.

---

## 🚀 Technical Walkthrough

### RAG Workflow
1. **Query Processing**: User queries are analyzed for intent (e.g., greetings are handled with low-latency direct responses).
2. **Semantic Retrieval**: Relevant context is retrieved from the vector database using cosine similarity (threshold > 0.4).
3. **Context Synthesis**: The AI model (Llama 3) synthesizes the retrieved facts into a natural, "snarky music journalist" persona.
4. **Safety & Guardrails**: Non-musical questions are snarkily redirected, ensuring the AI remains focused on the music industry.

### Database Integration
The project recently migrated from Cloud Firestore to **Firebase Realtime Database (RTDB)** for certain mobile features to improve reliability and reduce UI freezing during heavy database operations.

---

## 🛠 How it Works: Core Workflows

### 📱 Artist Command Center Experience
1. **Authentication**: Users log in via the mobile app, with session management handled through `@shared/context/AuthContext`.
2. **Dashboard Synthesis**: Upon entry, the app fetches real-time streaming data from the `spotify-service` and financial data from the `media-service`.
3. **Task Management**: Managers can assign tour logistics or update artist bios, which immediately syncs across the platform via Firebase RTDB.
4. **Collaboration**: Real-time communication occurs through the `social-service`, enabling teams to coordinate tours and releases.

### 🤖 BeatBot Interaction Flow
1. **User Query**: A fan asks a question via the web widget (e.g., "What was U2's first album?").
2. **Intent Analysis**: The backend checks if it's a greeting or a music-specific question.
3. **Semantic Search**: The `chat-service` generates a vector embedding of the query and searches the `knowledge_items` and `artists` tables.
4. **Contextual Response**: If a match is found, the context is fed into Llama 3.2. If no match is found, it fallbacks to a keyword search or a snarky "I'm not sure" response.
5. **Witty Persona**: The final response is wrapped in a sarcastic, enthusiast music journalist persona, complete with bolded names and Wikipedia links for band members.

---

## 🛠 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker (for backend services)
- Expo Go (for mobile development)
- Ollama (for local AI model hosting)

### Installation
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```

2. **Setup Backend**:
   ```bash
   cd beatconnect-dev/ai-backend
   npm install
   cp .env.example .env
   # Start with Docker
   docker-compose up -d
   ```

3. **Setup Admin Portal**:
   ```bash
   cd beatconnect-dev/ai-admin-portal
   npm install
   npm run dev
   ```

4. **Setup Mobile App**:
   ```bash
   cd beatconnect-mobile
   npm install
   npx expo start
   ```

---

## 📄 Documentation
- [Chatbot FAQ & Personality Guide](file:///Users/htgbao/Documents/Work/beatconnect-dev/docs/chatbot_faq.md)
- [Chat Widget Integration Guide](file:///Users/htgbao/Documents/Work/beatconnect-dev/README.md)

---

## 📈 Project Evolution & Milestones

This project has evolved through several key development phases:

1. **Phase 1: Foundation & Chatbot (BeatBot 1.0)**
   - Initial implementation of the chat service and widget.
   - Basic knowledge retrieval for music legends.

2. **Phase 2: RAG Integration (BeatBot 2.0)**
   - Implemented Retrieval-Augmented Generation (RAG) using **Ollama (Llama 3.2)**.
   - Added semantic vector search with cosine similarity.
   - Expanded knowledge base to include artists, bios, and daily reports.

3. **Phase 3: Command Center Transformation**
   - Redesigned the BeatConnect mobile app into a high-fidelity "Command Center" for artists.
   - Integrated real-time metrics, financial tracking, and legal document management.

4. **Phase 4: Database & UI Optimization**
   - Migrated core artist management features to **Firebase Realtime Database (RTDB)** for enhanced reliability.
   - Modernized the Admin Portal with a premium glassmorphic UI.

---

## 🤝 Contributing
BeatConnect is built with a focus on high-fidelity UI and robust AI integrations. Please ensure all UI changes adhere to the premium design system (glassmorphism, vibrant gradients, and micro-animations).
