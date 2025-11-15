# Focus Ramp

A web application that helps people gradually build their capacity for focused work using structured Pomodoro sessions.

## What It Does

Focus Ramp turns a long-term focus goal into a structured training plan. Instead of trying to work for hours on day one, the app creates a gradual ramp that builds your deep work capacity over time.

You define:

- How long you want to be able to focus each day (target daily minutes)
- When you want to reach that level (end date)
- Which days you want to train (e.g. Monday through Friday)

Focus Ramp automatically generates a day-by-day plan that:

- Starts with manageable sessions
- Increases incrementally over training days
- Respects your chosen training schedule
- Guides you through each day using Pomodoro-style work and break segments

## How It Works

Each training day includes:

- A specific daily target focus time
- Structured work sessions (maximum 25 minutes each)
- Short breaks between sessions (5 minutes)
- A timer that guides you segment by segment

As you progress through the plan:

- Daily targets gradually increase
- Your focus capacity builds naturally
- You track completion and maintain streaks
- The final day reaches your target daily focus time

## Design Philosophy

The app emphasizes gentle progression and clarity. The interface uses a calm, glassmorphic design inspired by Apple's aesthetic, creating a distraction-free environment that supports deep work rather than adding cognitive load.

## Tech Stack

- **Frontend:** Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend:** Firebase Authentication + Firestore
- **Deployment:** Cloudflare Workers (via OpenNext.js)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Firebase project (see [Firebase Setup Guide](./docs/firebase-setup.md))

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd focus-ramp
```

2. Install dependencies:

```bash
npm install
```

3. Set up Firebase:
   - Follow the [Firebase Setup Guide](./docs/firebase-setup.md)
   - Copy `.env.local.example` to `.env.local`
   - Add your Firebase configuration values

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

### Deploy to Cloudflare

```bash
npm run deploy
```

## Project Structure

```
focus-ramp/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Protected app routes
│   │   ├── today/         # Today view (main dashboard)
│   │   ├── history/       # History view
│   │   └── settings/      # Settings view
│   ├── auth/              # Authentication pages
│   │   ├── signin/        # Sign in page
│   │   └── signup/        # Sign up page
│   └── onboarding/        # Goal configuration flow
├── components/            # Reusable React components
│   └── AuthProvider.tsx   # Auth context provider
├── lib/                   # Utility functions and helpers
│   ├── firebase/          # Firebase client setup
│   ├── firestore/         # Firestore data access
│   ├── types/             # TypeScript type definitions
│   └── hooks/             # Custom React hooks
└── docs/                  # Documentation
    ├── firebase-setup.md  # Firebase setup instructions
    └── focus-ramp-design.md  # Product design document
```

## Current Status

**Phase 1: Complete ✓**
- Firebase Authentication (email/password with verification)
- Firestore integration
- Onboarding flow (goal configuration)
- Basic plan creation and display
- Protected routes

**Phase 2: In Progress**
- Daily ramp generator (TODO)
- Pomodoro timer (TODO)
- Session tracking (TODO)
- History view (TODO)

## Documentation

- [Firebase Setup Guide](./docs/firebase-setup.md) - Complete Firebase configuration instructions
- [Product Design](./docs/focus-ramp-design.md) - Detailed product vision and design
- [Best Practices](./docs/best-practices.md) - Development guidelines

## License

MIT
