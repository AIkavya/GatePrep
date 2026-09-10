# GATE Prep

A high-performance, distraction-free study management platform designed specifically for GATE (Graduate Aptitude Test in Engineering) aspirants. It provides priority-stack learning queues, a spaced-repetition revision engine, an integrated Past Year Questions (PYQ) tracker with step-by-step solutions, a full-length mock test analytics dashboard, and an embedded SQLite database for secure data persistence.

---

## Table of Contents

- [Core Capabilities](#core-capabilities)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Step-by-Step Usage Guide](#step-by-step-usage-guide)
  - [1. Account Authentication & Guest Mode](#1-account-authentication--guest-mode)
  - [2. Curriculum & Subject Setup](#2-curriculum--subject-setup)
  - [3. Active Learning Queue](#3-active-learning-queue)
  - [4. Spaced Repetition Revision Engine](#4-spaced-repetition-revision-engine)
  - [5. PYQ Practice & Question Bank](#5-pyq-practice--question-bank)
  - [6. Mock Exam Tracker & Diagnostic Analytics](#6-mock-exam-tracker--diagnostic-analytics)
  - [7. Interactive Study Calendar](#7-interactive-study-calendar)
- [Data Storage & Persistence Architecture](#data-storage--persistence-architecture)
- [REST API Reference](#rest-api-reference)
- [Development & Verification](#development--verification)
- [License](#license)

---

## Core Capabilities

- **Priority-Stack Learning Queue**: Organizes chapters dynamically by priority weightage (1–20) rather than static checklists. Advancing progress to 100% automatically schedules the chapter into Spaced Repetition.
- **Automated Spaced Repetition Engine**: Calculates real-time revision due dates based on the forgetting curve (configurable: default 7, 14, and 28-day intervals). Revisions dynamically categorize as _Due Today_, _Overdue_, _Upcoming_, or _Completed_.
- **10,000+ PYQ Question Bank & Focus Queue**: Practice questions filtered by year (1990–Present), subject, chapter, status, and difficulty. Includes interactive step-by-step mathematical solutions and cycle counters.
- **Mock Exam Analytics Engine**: Log and evaluate Full-Length Mocks (65 questions, 100 marks, 180 mins), Subject Tests, and Topic Tests. Automatically calculates net score, accuracy percentage, negative marking penalties (1/3 and 2/3 deductions), and flags weak vs. strong topics.
- **Multi-Tenant SQLite Persistence**: Lightweight, zero-config relational database powered by `sql.js` (WebAssembly) with dual-layer JSON write-through fallback to guarantee zero data loss across container cold starts.
- **Multi-Tab Session Synchronization**: JWT session tokens are verified on both the server and client. Changes in login status in one tab instantly propagate to all other open tabs without requiring manual page reloads.
- **Apple-Inspired Minimalist Interface**: Built with high-contrast typography, generous padding, and full support for both Light and Dark themes.

---

## Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                     React 19 Frontend                   │
│   Tailwind CSS v4 • Lucide Icons • Optimistic Caching   │
└────────────────────────────┬────────────────────────────┘
                             │  HTTP / REST (JWT Bearer)
┌────────────────────────────▼────────────────────────────┐
│                    Express Backend                      │
│      JWT Auth (HS256) • Bcrypt • RESTful Endpoints      │
└────────────────────────────┬────────────────────────────┘
                             │  Transactions & WAL
┌────────────────────────────▼────────────────────────────┐
│                Dual-Layer Storage Engine                │
│    SQLite (sql.js WebAssembly) + JSON Backup Store      │
└─────────────────────────────────────────────────────────┘
```

| Layer                  | Technologies                                                  |
| :--------------------- | :------------------------------------------------------------ |
| **Frontend Framework** | React 19, TypeScript, Vite                                    |
| **Styling & Layout**   | Tailwind CSS v4, Motion                                       |
| **Icons**              | Lucide React                                                  |
| **Server Runtime**     | Node.js, Express.js                                           |
| **Authentication**     | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`                  |
| **Database**           | SQLite via `sql.js` (WASM) with dual-layer JSON write-through |
| **Tooling & Build**    | `esbuild`, `tsx`, Vite                                        |

---

## Getting Started

### Prerequisites

- **Node.js**: Version `18.0.0` or higher (`20.x` or `22.x` recommended)
- **npm**: Version `9.0.0` or higher

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/gate-prep.git
   cd gate-prep
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

- **Development Mode** (boots full-stack server and Vite dev middleware on port 3000):

  ```bash
  npm run dev
  ```

  Open your browser and navigate to:

  ```
  http://localhost:3000
  ```

- **Production Build**:

  ```bash
  npm run build
  ```

- **Production Run**:
  ```bash
  npm start
  ```

---

## Step-by-Step Usage Guide

### 1. Account Authentication & Guest Mode

- **Sign In / Register**: Create a personal account with a unique username and password. Usernames are case-insensitive (`Kavya` and `kavya` map to the same account).
- **Guest Mode**: Click **"Continue as Guest Aspirant"** for instant, local-first access without creating an account.
- **Cross-Tab Safety**: If you log out in one browser tab, all other active tabs instantly sync and redirect to the sign-in modal.

### 2. Curriculum & Subject Setup

- **Clean Slate by Default**: Every new account starts with zero clutter (0 subjects, 0 chapters).
- **One-Click Template Import**: Click **"Load GATE CS Template"** on the Dashboard or in the Settings menu to instantly import the complete GATE Computer Science & IT syllabus:
  - Database Management Systems (DBMS)
  - Operating Systems (OS)
  - Algorithms (ALGO)
  - Computer Networks (CN)
  - Data Structures (DS)
  - Computer Organization & Architecture (COA)
  - Theory of Computation (TOC)
  - Discrete Mathematics (DM)
  - Engineering Mathematics (EM)
  - Compiler Design (CD)
  - Digital Logic (DL)
- **Custom Subjects**: Add, edit, or color-code your own target subjects with priority weights and target completion dates.

### 3. Active Learning Queue

- Navigate to the **Learning** tab.
- Chapters are organized into a **Priority Stack** sorted by urgency and importance (highest priority at the top).
- **Update Progress**: Use the progress slider or quick adjustment buttons.
- **Marking Complete**: Reaching 100% marks the chapter as completed and automatically pushes it into the **Spaced Repetition Engine** for Revision 1.

### 4. Spaced Repetition Revision Engine

- Navigate to the **Revisions** tab.
- Revisions are grouped into:
  - **Due Today**: Items requiring active recall today.
  - **Overdue**: Missed revisions highlighted in red.
  - **Upcoming**: Scheduled future reviews.
  - **History**: Completed or skipped revision logs.
- **Rescheduling**: Click the calendar icon on any revision card to defer or bring forward a revision to a custom date.
- **Custom Spaced Intervals**: Click **Settings** in the revision tab to configure standard intervals (e.g., 5 days, 10 days, 21 days).

### 5. PYQ Practice & Question Bank

- Navigate to the **PYQs** tab.
- Toggle between:
  - **Focus Queue**: Displays active problem-solving sets for the chapters you are currently studying.
  - **Question Bank**: Search across years, subjects, question types (MCQ, MSQ, NAT), and marks (1 Mark / 2 Marks).
- **Interactive Solutions**: Click **"Show Detailed Solution"** to reveal step-by-step mathematical proofs and theoretical derivations.
- **Cycle Tracking**: Track how many times you have solved an entire subject's past papers (`Cycle 1`, `Cycle 2`).

### 6. Mock Exam Tracker & Diagnostic Analytics

- Navigate to the **Mock Tests** tab.
- Click **"+ Log Mock Exam"** to record an attempt:
  - **Exam Types**: Full Length Mock (100 marks), Subject Test, or Topic Test.
  - **Metrics Recorded**: Time taken, total questions, questions attempted, correct questions, wrong questions, and negative marks deducted.
- **Automatic Diagnostics**:
  - Net Score and Accuracy percentage calculated instantly.
  - Visual charts showing score progression over time.
  - Weak Topics list highlighted for targeted revision before the actual GATE exam.

### 7. Interactive Study Calendar

- Navigate to the **Calendar** tab.
- View month-by-month study timelines.
- Scheduled revisions, exam milestones, and active learning goals are color-coded and synchronized automatically.

---

## Data Storage & Persistence Architecture

The application uses an embedded **SQLite** database using `sql.js` (compiled to WebAssembly) combined with an asynchronous write-through JSON backup layer.

### Tables & Schema

1. **`users` Table**:

   ```sql
   CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     username TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     created_at TEXT NOT NULL
   );
   CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
   ```

2. **`study_data` Table**:
   ```sql
   CREATE TABLE IF NOT EXISTS study_data (
     user_id TEXT PRIMARY KEY,
     subjects_json TEXT NOT NULL,
     chapters_json TEXT NOT NULL,
     revisions_json TEXT NOT NULL,
     pyqs_json TEXT NOT NULL,
     pyq_queue_json TEXT NOT NULL,
     calendar_json TEXT NOT NULL,
     exams_json TEXT NOT NULL,
     settings_json TEXT NOT NULL,
     updated_at TEXT NOT NULL,
     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );
   ```

### Multi-Tenant Isolation

Every study data record is strictly bound to the authenticated user's ID (`usr_<username>_<entropy>`). No user can view, edit, or delete another user's records.

---

## REST API Reference

All protected endpoints require an `Authorization: Bearer <token>` HTTP header.

| Method | Endpoint                    |  Protection  | Description                                                 |
| :----- | :-------------------------- | :----------: | :---------------------------------------------------------- |
| `GET`  | `/api/health`               |    Public    | Server and database health check                            |
| `POST` | `/api/auth/register`        |    Public    | Register a new account (`username`, `password`)             |
| `POST` | `/api/auth/login`           |    Public    | Authenticate user and receive signed JWT                    |
| `GET`  | `/api/auth/me`              | Bearer Token | Validate existing token and return user profile             |
| `GET`  | `/api/gate/data`            | Bearer Token | Retrieve all subjects, chapters, revisions, pyqs, and exams |
| `PUT`  | `/api/gate/data`            | Bearer Token | Atomically save user study workspace                        |
| `POST` | `/api/gate/reset`           | Bearer Token | Reset workspace to fresh empty slate (`0` records)          |
| `POST` | `/api/gate/import-template` | Bearer Token | Import the standard GATE Computer Science syllabus template |

---

## Development & Verification

To run the automated pre-production test suite:

```bash
npx tsx scripts/verify_production.mjs
```

This validates:

- Health check endpoints
- SQLite database initialization
- User registration and bcrypt password hashing
- Case-insensitive login and authentication
- Unauthorized request rejection
- Multi-tenant data isolation
- Custom study data save and retrieval fidelity
- Template import and workspace reset

To run code linting and type verification:

```bash
npm run lint
```

---

## License

This project is licensed under the [MIT License](LICENSE).
