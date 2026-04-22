# 🏆 CodeArena - DSA Contest Platform

A high-performance, full-stack online DSA contest platform built with **Spring Boot 3**, **React**, **MongoDB**, and **WebSocket**. CodeArena is designed for real-time competitive programming with a premium, interactive user experience.

## ✨ Key Features

### 💎 Premium Experience
- **Interactive 3D UI** — Stunning animated login screen powered by **Three.js** and **React Three Fiber**.
- **Awwwards-Level Design** — Glassmorphism UI with smooth **Framer Motion** transitions and dark-mode aesthetics.
- **Dynamic Dashboard** — Staggered animations and real-time status indicators for all contests.
- **Advanced Workspace** — Split-pane contest layout with a professional **Monaco Code Editor** and floating results panel.

### 🎮 Contest Management
- **Full Admin Control** — Pause, Resume, Extend, or Delete active contests in real-time.
- **Safety Checks** — Prevention of empty contest starts (must have questions in the bank).
- **Scheduled & Manual Starts** — Support for both instant contests and time-scheduled events.
- **CSV User Import** — Batch upload participants with automated password generation (Roll No based).

### ⚙️ Technical Core
- **Automatic Evaluation** — Real-time code execution for **Java** and **C++** with high-speed process isolation.
- **Partial Scoring** — Granular test-case marks with a configurable penalty system.
- **Live Leaderboard** — Instant ranking updates with specialized tie-breaking logic.
- **Anti-Cheat System** — Tab-switch detection (3-strike system) with full-screen focus enforcement.

---

## 🏗 Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| **Backend** | Java 21, Spring Boot 3.5.0          |
| **Database**| MongoDB (Atlas / Local)             |
| **Frontend**| React 18, Vite 5, Tailwind CSS 3    |
| **Animation**| Framer Motion, Three.js, R3F        |
| **Real-time**| WebSocket (STOMP + SockJS)          |
| **Auth**    | JWT (jjwt 0.12.5) + BCrypt          |

---

## 🚀 Getting Started

### Prerequisites
- **Java 21** (JDK)
- **Node.js 18+** & npm
- **MongoDB**
- **javac & g++** (Must be in your system PATH for code evaluation)

### 1. Installation
```bash
git clone <your-repo-url>
cd DSA-Contest-Site
```

### 2. Backend Setup
```bash
cd backend
# Build and run
./mvnw spring-boot:run  # Or mvnw.cmd on Windows
```
> **Default Admin:**
> - Email: `abhineet.24b0101526@abes.ac.in`
> - Password: `2400320100044_admin`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will be available at **http://localhost:5173**

---

## 🔒 Security & Performance

- **JWT Protection:** All sensitive APIs are stateless and protected by JWT.
- **CORS Config:** Ready for multi-port local development.
- **Anti-Cheat:** Integrated tab-focus tracking and interaction blocking (right-click/copy-paste).
- **Optimization:** 60fps animations with optimized React component lifecycles.

## 📄 License
MIT
