
# AI Powered Group Travel Planner

A full-stack AI-powered travel planning platform where groups can:
- Create trips
- Add members
- Vote on destinations
- Generate AI itineraries
- Manage budgets collaboratively

## Tech Stack

### Frontend
- React + Vite
- TailwindCSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- OpenAI API Integration

---

## Features

- Authentication-ready architecture
- AI itinerary generation
- Group collaboration
- Budget estimation
- Voting system
- Clean scalable architecture

---

## Folder Structure

```bash
ai-group-travel-planner/
  frontend/
  backend/
```

---

## How To Run

### 1. Clone Repo

```bash
git clone <your-repo-url>
cd ai-group-travel-planner
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection
OPENAI_API_KEY=your_openai_key
```

Run backend:

```bash
npm run dev
```

Backend runs on:
http://localhost:5000

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on:
http://localhost:5173

---

## Interview-Level Discussion Points

### Scalability
- Modular backend architecture
- Service layer abstraction
- Environment-based configs

### AI Engineering
- Prompt engineering
- AI response sanitization
- Token optimization

### System Design
- Group collaboration model
- Voting algorithms
- Real-time updates possibility with Socket.IO

### Security
- JWT authentication ready
- Rate limiting
- Input validation

---

## Future Improvements

- Real-time chat
- AI budget optimizer
- Flight & hotel APIs
- Maps integration
- Recommendation engine
