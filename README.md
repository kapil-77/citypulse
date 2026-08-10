<div align="center">

# 🚦 CityPulse

### AI-Powered Civic Intelligence & Issue Reporting Platform

Transforming citizen-reported issues into actionable civic insights using **Gemini AI**, **Supabase**, **Cloudinary**, and a modern full-stack architecture.

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?logo=express" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_AI-4285F4?logo=google&logoColor=white" />
</p>

</div>

---

## ✨ Overview

CityPulse is an AI-powered civic issue reporting platform that enables citizens to report, verify, and monitor public issues through an intuitive interface. It combines **AI-assisted issue analysis**, **location-based discovery**, **cloud image storage**, and **real-time dashboards** to create a smarter civic engagement experience.

---

## 🌟 Key Features

### 🤖 AI Powered

- AI issue analysis using **Gemini**
- Automatic issue categorization
- Severity prediction
- AI-generated summaries & insights
- Smart recommendations

### 📍 Location Intelligence

- Search by Indian city/state
- Interactive maps
- Nearby issue discovery
- Location-aware filtering

### 📸 Smart Reporting

- Image upload
- Cloudinary image storage
- Timeline tracking
- Community verification
- Status updates

### 📊 Dashboard

- AI Command Center
- Health Score
- Live Metrics
- Issue Heatmap
- Trending Categories
- Recent Activity

---

# 📸 Screenshots

> Replace these with actual screenshots/GIFs.

| Home | Report Issue |
|------|--------------|
| <img width="1911" height="993" alt="image" src="https://github.com/user-attachments/assets/0b1c6fe2-4d88-40c3-b88c-952fbac18685" /> | (<img width="1917" height="1028" alt="image" src="https://github.com/user-attachments/assets/d5faa6fa-dff3-419f-9059-383bfb837269" />
|

| AI Dashboard | Issue Details |
|--------------|---------------|
| ![](docs/dashboard.png) | <img width="1917" height="1033" alt="image" src="https://github.com/user-attachments/assets/dde8d3ba-540f-4055-a23f-755e9b06d48f" />
|

---

# 🏗 Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Zustand
- React Router
- Framer Motion
- React Hook Form
- Leaflet

## Backend

- Node.js
- Express.js

## Database

- Supabase PostgreSQL

## Storage

- Cloudinary

## AI

- Google Gemini API

---

# 🚀 Architecture

```text
                    React + Vite
                         │
                         ▼
                  Express Backend
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
  Supabase PostgreSQL              Cloudinary
      (Data)                        (Images)
                         │
                         ▼
                    Gemini AI
```

---

# ⚡ AI Capabilities

- AI Issue Classification
- AI Severity Detection
- AI Civic Insights
- AI Health Score
- AI Dashboard Analytics
- AI Recommendations

---

# 📂 Project Structure

```text
CityPulse
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── store/
│   ├── hooks/
│   └── utils/
│
├── server/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── utils/
│
├── public/
└── README.md
```

---

# ⚙️ Environment Variables

```env
VITE_GEMINI_API_KEY=

VITE_API_URL=

SUPABASE_URL=

SUPABASE_SERVICE_ROLE_KEY=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---

# 🖥 Local Setup

```bash
git clone https://github.com/yourusername/citypulse.git

cd citypulse

npm install

npm run dev:all
```

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:3001
```

---

# 🚀 Deployment

| Service | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase |
| Image Storage | Cloudinary |

---

# 📌 Future Roadmap

- AI duplicate issue detection
- Geolocation support
- Push notifications
- User authentication
- Leaderboards
- Predictive civic analytics
- Mobile PWA
- Government dashboard
- Multi-language support

---

# 💡 Why CityPulse?

Instead of being just another complaint portal, CityPulse transforms civic reports into **actionable intelligence** using AI, cloud-native architecture, and an engaging modern interface.

---

<div align="center">

### ⭐ If you found this project interesting, consider giving it a star!

Made with ❤️ using React, Express, Supabase, Cloudinary & Gemini AI.

</div>
