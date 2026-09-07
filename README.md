# Q-Up

A real-time web-based virtual queue management system built to eliminate physical ticket dispensers and congested waiting lines. Q-Up allows customers to join a virtual queue by scanning a QR code on their smartphone and track their position live, while merchants manage queue flow through an administrative dashboard.

**Recognition:** Silver Medal, Pertandingan Inovasi Antara Asasi Malaysia (PITRAM) 2026.

---

## System Overview

Q-Up decouples the customer-facing interface from the merchant administration portal while maintaining real-time, bidirectional state synchronization across devices using WebSockets:

1. **Customer Flow:**
   - The customer scans a static QR code displayed at the merchant counter or entrance.
   - A virtual ticket is generated with a unique queue number and timestamp.
   - The web interface displays live queue status, number of parties ahead, and estimated wait times.
   - When called by the merchant, the device triggers an audio/visual notification.

2. **Merchant Flow:**
   - The merchant logs into the administrative portal to control the queue.
   - Provides real-time buttons to call the next customer, recall, mark as served, or cancel tickets.
   - Controls are broadcasted immediately to all connected customer devices via WebSockets.

---

## Tech Stack

### Frontend (`/client`)
- **Framework:** React.js (v18)
- **Routing:** React Router DOM (v6)
- **Real-Time Communication:** Socket.IO Client
- **HTTP Client:** Axios
- **Styling:** Custom CSS3 (Flexbox, Grid, CSS Keyframe Animations)
- **Utilities:** `qrcode` for QR code rendering

### Backend (`/server`)
- **Runtime:** Node.js
- **API Framework:** Express.js
- **WebSocket Engine:** Socket.IO Server
- **Database ODM:** Mongoose
- **Push Notifications:** Web Push (VAPID protocol)

### Database
- **Primary Database:** MongoDB Atlas (cloud document store)

---

## Project Structure

```text
q-up-app/
├── client/                  # React frontend client & admin application
│   ├── public/              # Static assets and HTML template
│   ├── src/
│   │   ├── components/      # Reusable UI components (Navbar, QueueCard, etc.)
│   │   ├── pages/           # Customer ticket view, admin dashboard, display board
│   │   ├── App.js           # Main application routing
│   │   └── index.js         # React DOM entry point
│   └── package.json
│
├── server/                  # Node.js Express & WebSocket backend
│   ├── controllers/         # Queue, ticket, and merchant request logic
│   ├── models/              # Mongoose schemas (Queue, Ticket, Merchant)
│   ├── routes/              # Express REST API endpoints
│   ├── utils/               # Socket.IO event handlers and push helpers
│   ├── server.js            # Server entry point and HTTP/WebSocket listener
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or higher)
- [npm](https://www.npmjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or local MongoDB instance

---

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   ```

4. Start the backend development server:
   ```bash
   npm start
   ```
   The backend server runs at `http://localhost:5000`.

---

### Frontend Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The client application opens automatically at `http://localhost:3000`.

---

## Live Deployment

- **Client Application:** [https://q-up-client.onrender.com](https://q-up-client.onrender.com)
