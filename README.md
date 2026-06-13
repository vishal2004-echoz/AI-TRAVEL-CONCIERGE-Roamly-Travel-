# 🌍 Roamly – AI-Powered Travel Companion

Roamly is a modern AI-driven travel planning platform that helps travelers discover destinations, generate personalized itineraries, analyze travel preferences, optimize budgets, and receive intelligent travel recommendations.

Built with a React frontend and FastAPI backend, Roamly combines advanced AI capabilities with real-time travel data to create a smarter travel experience.

---

## 🚀 Features

### ✨ AI Travel Assistant
- Interactive AI travel concierge
- Personalized travel recommendations
- Smart travel planning assistance

### 🧬 Travel DNA Analysis
- Analyze traveler personality and preferences
- Generate unique travel profiles
- Personalized destination matching

### 🗺️ Destination Explorer
- Explore destinations worldwide
- Nearby places discovery
- Country information lookup
- Geolocation services

### 📅 AI Itinerary Generator
- Generate complete travel plans
- Day-wise schedules
- Activity recommendations
- Custom trip planning

### 💰 Budget Truth Analyzer
- Realistic travel cost estimation
- Budget breakdown insights
- Expense optimization suggestions

### 🔥 Trip Roast
- Fun AI-powered travel critiques
- Entertainment-focused travel analysis

### ⚔️ Destination Battle
- Compare destinations side-by-side
- AI-generated recommendations
- Smart decision support

### 🤔 Travel What-If Scenarios
- Simulate travel possibilities
- Alternative travel plans
- Dynamic itinerary suggestions

### 📊 Analytics Dashboard
- User travel statistics
- Activity tracking
- Travel insights

### 🔐 Authentication System
- Secure JWT authentication
- User registration and login
- Protected routes
- Profile management

---

# 🏗️ Project Architecture

```text
Roamly
│
├── frontend/                 # React + Vite Frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── api/
│
├── backend/                  # FastAPI Backend
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── main.py
│
└── README.md
```

---

# 🛠️ Tech Stack

## Frontend

| Technology | Purpose |
|------------|----------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| React Router | Routing |
| Axios | API Communication |
| Framer Motion | Animations |
| Leaflet | Maps Integration |
| React Google Maps API | Google Maps Support |

---

## Backend

| Technology | Purpose |
|------------|----------|
| FastAPI | API Framework |
| MongoDB | Database |
| Beanie ODM | Database Models |
| Motor | Async MongoDB Driver |
| JWT | Authentication |
| Bcrypt | Password Hashing |
| Gemini AI | AI Features |
| HTTPX | Async HTTP Requests |
| SlowAPI | Rate Limiting |

---

# 📋 Prerequisites

Before running the project, ensure you have:

- Python 3.10+
- Node.js 18+
- MongoDB
- Google Gemini API Key

---

# ⚙️ Backend Setup

## 1. Navigate to Backend

```bash
cd backend
```

## 2. Create Virtual Environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 4. Configure Environment Variables

Create a `.env` file:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

## 5. Run Backend Server

```bash
python main.py
```

Backend runs at:

```text
http://localhost:5000
```

---

# 🎨 Frontend Setup

## 1. Navigate to Frontend

```bash
cd frontend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Start Development Server

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

# 📡 API Endpoints

## Authentication

| Endpoint | Method |
|-----------|---------|
| /api/auth/signup | POST |
| /api/auth/login | POST |
| /api/auth/me | GET |
| /api/auth/logout | POST |

---

## AI Services

| Endpoint | Method |
|-----------|---------|
| /api/ai/chat | POST |
| /api/ai/vibe-search | POST |
| /api/ai/trip-roast | POST |
| /api/ai/battle | POST |
| /api/ai/what-if | POST |
| /api/ai/itinerary | POST |
| /api/ai/budget-truth | POST |
| /api/ai/analyze-dna | POST |
| /api/ai/packing-list | POST |
| /api/ai/culture-coach | POST |

---

## Destinations

| Endpoint | Method |
|-----------|---------|
| /api/destinations/explore | POST |
| /api/destinations/places-nearby | GET |
| /api/destinations/geocode | GET |
| /api/destinations/country-info | GET |

---

## User Services

| Endpoint | Method |
|-----------|---------|
| /api/user/profile | GET / PATCH |
| /api/user/trips | GET / POST / DELETE |
| /api/user/autopsy | POST |
| /api/user/dna | PATCH |
| /api/user/wishlist | POST |
| /api/user/history | GET |

---

# 📖 API Documentation

FastAPI automatically generates Swagger documentation.

Open:

```text
http://localhost:5000/docs
```

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing with Bcrypt
- Protected API Routes
- Rate Limiting
- Environment Variable Protection

---

# 🚀 Deployment

## Frontend

Suitable platforms:

- Vercel
- Netlify
- Cloudflare Pages

## Backend

Suitable platforms:

- Render
- Railway
- AWS
- DigitalOcean
- Azure App Services

---
# 🌐 Live Demo

## Frontend
🔗 https://roamly-travel-iota.vercel.app/

## Backend API
🔗 https://roamly-api.onrender.com

## API Documentation
🔗 https://roamly-api.onrender.com/docs
# 📈 Future Enhancements

- Hotel recommendations
- Flight integrations
- Real-time booking support
- AI voice assistant
- Multi-language support
- Travel community features
- Offline itinerary mode

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

Developed with ❤️ to make travel planning smarter using AI.

**Roamly – Explore Smarter, Travel Better.**
