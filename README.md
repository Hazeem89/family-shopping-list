# Family Shopping List

A real-time collaborative shopping list app for families. Multiple family members can add, check off, and delete items — changes sync instantly across all connected devices.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Supabase (Auth, Database, Realtime) |
| Deployment | Vercel |

## Live Demo

https://family-shopping-list-three.vercel.app/

## Features

- Sign up / sign in with email and password
- Create a family or join one with an invite code
- Add, check off, and delete shopping items
- Real-time sync — changes appear instantly for all family members
- Live online presence — see how many family members are currently active
- Activity feed showing recent actions (added, checked, removed)
- Invite code displayed in the header for easy sharing (admin only)

## Project Structure

```
client/
└── src/
    ├── lib/
    │   └── supabase.js               # Supabase client singleton
    ├── hooks/
    │   ├── useAuth.js                # Session, signIn, signUp, signOut
    │   ├── useFamily.js              # Family data, create, join
    │   └── useItems.js               # Items CRUD + Realtime subscription
    ├── components/
    │   ├── auth/
    │   │   ├── AuthPage.jsx
    │   │   ├── SignInForm.jsx
    │   │   └── SignUpForm.jsx
    │   ├── family/
    │   │   ├── FamilySetup.jsx
    │   │   ├── CreateFamily.jsx
    │   │   └── JoinFamily.jsx
    │   ├── Header.jsx
    │   ├── AddItemForm.jsx
    │   ├── ItemList.jsx
    │   ├── ItemRow.jsx
    │   └── ActivityFeed.jsx
    ├── App.jsx
    ├── main.jsx
    └── index.css
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with the schema from `.ai/schema.sql`

### Installation

```bash
cd client
npm install
```

### Environment Variables

Create `client/.env`:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the App

```bash
cd client
npm run dev
```

App opens at `http://localhost:5173`

## How It Works

1. Sign up and a profile is created automatically
2. Create a family — you get an invite code to share
3. Other family members sign up and join using the invite code
4. All members share the same shopping list, synced in real time via Supabase Realtime
