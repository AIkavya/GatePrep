# GATE Prep

> A simple personal study management app built for GATE CSE preparation.

🔗 **Live Preview:** [Open GATE Prep](YOUR_LIVE_PREVIEW_URL)

## Overview

**GATE Prep** is a lightweight study management application designed to help GATE CSE aspirants organize their preparation in one place.

It focuses on four core areas:

- 📚 **Learning** — Manage chapters based on priority and track current learning.
- 🔄 **Revision** — Automatically organize completed chapters for scheduled revision.
- 📝 **PYQs** — Practice and track previous year questions subject-wise and chapter-wise.
- 📅 **Calendar** — Maintain a separate preparation calendar for each subject.

The goal is simple:

> **Know what to study, what to revise, and what PYQs to solve today.**

## Features

### 📚 Learning

Manage your learning queue using chapter priorities.

- Add subjects and chapters
- Set chapter priorities
- Track learning progress
- Mark chapters as completed
- Automatically move completed chapters into revision

### 🔄 Revision

Keep track of completed chapters using a scheduled revision system.

Default revision cycle:

```text
Chapter Completed
       ↓
Revision 1 → 7 days
       ↓
Revision 2 → 14 days
       ↓
Revision 3 → 28 days
```

The revision schedule can be viewed from the revision dashboard and subject calendar.

### 📝 PYQ

Organize GATE Previous Year Questions by:

```text
Subject
   ↓
Chapter
   ↓
Year
   ↓
Question
```

Track:

- Attempted questions
- Correct answers
- Wrong answers
- Skipped questions
- Difficulty level
- Chapter-wise performance

### 📅 Subject-wise Calendar

Each subject has its own preparation calendar.

For example:

```text
DBMS Calendar
OS Calendar
CN Calendar
Algorithms Calendar
DS Calendar
...
```

Learning, revision, and PYQ activities can be represented on the calendar.

## Tech Stack

- React
- TypeScript
- Modern CSS / Tailwind CSS
- LocalStorage for local data persistence

The initial version is designed to work without authentication or a backend.

## Getting Started

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

Navigate to the project:

```bash
cd gate-prep
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local development URL shown in your terminal.

## Project Structure

```text
src/
├── components/
├── pages/
├── data/
├── utils/
├── types/
└── App.tsx
```

## Roadmap

Future improvements may include:

- [ ] Cloud synchronization
- [ ] User authentication
- [ ] Backup and restore
- [ ] GATE exam countdown
- [ ] More detailed performance analytics
- [ ] Mobile PWA support
- [ ] Custom revision schedules
- [ ] Import/export of PYQs

## Disclaimer

GATE Prep is a personal study management tool and is not affiliated with or endorsed by IITs, IISc, or the official GATE examination authorities.

## License

This project is currently intended for personal and educational use.
