# Family Shopping List

A real-time fullstack web application where multiple users can collaboratively manage a shared shopping list. Changes appear instantly across all connected browsers — no page refresh needed.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Real-time | Socket.IO |
| Storage | In-memory array |

## Features

- Enter a username to join (saved in localStorage)
- Add, check off, and delete shopping items
- All changes sync instantly to every connected client via WebSockets
- Live user count showing how many people are online
- Activity feed showing the last 10 actions (joined, added, checked, removed)
- Newly added items flash yellow briefly as a highlight
- Press Enter to submit forms

## Project Structure

```
├── server/
│   ├── index.js          # Express + Socket.IO server
│   └── package.json
└── client/
    ├── src/
    │   ├── App.jsx               # State, socket logic, layout
    │   ├── socket.js             # Socket.IO client instance
    │   ├── main.jsx              # React entry point
    │   ├── index.css             # Tailwind + highlight animation
    │   └── components/
    │       ├── JoinScreen.jsx    # Username form
    │       ├── Header.jsx        # Title, user count, leave button
    │       ├── AddItemForm.jsx   # Add item input
    │       ├── ItemList.jsx      # Shopping list container
    │       ├── ItemRow.jsx       # Single item row
    │       └── ActivityFeed.jsx  # Live activity log
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

Install dependencies for both server and client:

```bash
cd server && npm install
cd ../client && npm install
```

### Running the App

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
Server starts at `http://localhost:3001`

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
App opens at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/items` | `{ name, user }` | Add a new item |
| PATCH | `/items/:id` | `{ user }` | Toggle bought status |
| DELETE | `/items/:id` | `{ user }` | Remove an item |

## WebSocket Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `setUser` | Client → Server | `username` | Register username on connect |
| `itemsUpdated` | Server → Client | `items[]` | Full updated items array |
| `activity` | Server → Client | `string` | Activity message |
| `userCount` | Server → Client | `number` | Current connected users |

## Data Flow

```
User action (add / toggle / delete)
  → HTTP request to Express
    → Backend updates in-memory array
      → Socket.IO emits to all clients
        → React state updates
          → UI re-renders instantly
```

## Demo

To test real-time sync:

1. Open `http://localhost:5173` in two browser windows side by side
2. Enter different usernames in each
3. Add an item in one window — it appears in the other instantly
4. Check or delete items — both windows stay in sync
5. Watch the user count and activity feed update live

or 
Run with: node demo.js  (while the server is running)
