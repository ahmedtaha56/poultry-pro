<div align="center">

<img src="https://img.shields.io/badge/Poultry_Pro-🐔_Poultry_Management-FF6B35?style=for-the-badge" alt="Poultry Pro" />

<br/>

![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

<br/>

**Poultry Pro** is a professional, comprehensive poultry management platform designed for small-scale poultry farmers, home poultry keepers, and local shopkeepers.  
Manage poultry health, disease detection, buy/sell marketplace, farming guides, and stay updated with news and alerts — all in one place.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Roadmap](#-roadmap) · [Contributing](#-contributing)

</div>

---

## 📋 Overview

Poultry Pro provides **AI-powered disease detection**, **real-time marketplace**, **comprehensive farming knowledge**, and **business intelligence** through an intuitive mobile interface. Designed to help poultry farmers and traders stay connected without the complexity of enterprise-grade software.

---

## ✨ Features

### 📱 Client Mobile App

#### 🤖 Disease Detection
- **AI Image Analysis** — Upload chicken images and detect diseases instantly using machine learning
- **Confidence Scoring** — Get accuracy metrics and severity levels
- **Disease Database** — Access symptoms, prevention, and treatment for detected diseases
- **Detection History** — Track all past disease detections and treatments applied

#### 🛒 Buy/Sell Marketplace
- **Create Listings** — Post chickens, eggs, feed, and poultry equipment for sale
- **Search & Filter** — Find products by location, price, category, and seller rating
- **Peer-to-Peer Chat** — Direct messaging between buyers and sellers
- **User Profiles** — Manage profile, view transaction history and ratings
- **Secure Transactions** — Transparent pricing and buyer/seller verification

#### 📚 Poultry Farming Guide
- **Step-by-Step Guide** — Breeding, feeding, housing, and hygiene best practices
- **Equipment Info** — Details on incubators, feeders, waterers, cages, ventilation systems
- **Care Schedules** — Vaccination timelines, feeding plans, and health checkups
- **Seasonal Tips** — Weather-specific care guidance during different seasons
- **Visual Tutorials** — Images and diagrams for each topic

#### 📰 News & Alerts
- **Disease Outbreak Alerts** — Real-time notifications on avian flu and Newcastle disease outbreaks
- **Market Price Updates** — Live chicken, egg, and feed prices in your region
- **Weather Alerts** — Critical weather warnings affecting poultry health
- **Stock Reminders** — Low feed alerts and vaccination reminders
- **Location-based** — Alerts specific to your area

#### 💬 AI Chatbot
- **24/7 Support** — Get instant answers to poultry-related queries anytime
- **Smart Responses** — Contextual answers based on your farming situation
- **Multi-language** — Support in Urdu, English, and regional languages
- **Learning System** — Chatbot improves with user feedback

### 🖥️ Admin Web Dashboard

#### 📊 Dashboard & Analytics
- **Summary Cards** — Total users, active listings, disease reports, marketplace transactions
- **Charts & Trends** — User growth, disease outbreaks by region, marketplace activity
- **Real-time Stats** — Live updates of all platform activities

#### 👥 User Management
- **User Monitoring** — Track user activities and engagement metrics
- **Role Management** — Assign admin, farmer, and trader roles
- **Profile Management** — View and manage user information
- **Ban/Suspend Users** — Handle policy violations

#### 📦 Content Moderation
- **Listing Review** — Approve or reject marketplace listings
- **Content Filtering** — Flag and remove inappropriate content
- **Chat Monitoring** — Monitor for spam or abuse in messaging

#### 🧠 AI Model Management
- **Training Data** — Collect and organize disease detection images
- **Model Updates** — Retrain disease detection AI with new data
- **Performance Metrics** — Monitor detection accuracy by disease type
- **Feedback Analysis** — Track user feedback for model improvement
- **Version Control** — Manage different model versions

#### 📈 Reports & Exports
- **User Reports** — Download user activity data
- **Disease Statistics** — Export disease detection reports by region and time
- **Market Reports** — Analyze marketplace trends and patterns
- **Custom Reports** — Create custom reports with filters

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend (Mobile)** | React Native, Expo |
| **Frontend (Web)** | React, TypeScript |
| **Backend & Auth** | Supabase (Auth, Database, Storage, Real-time) |
| **Database** | PostgreSQL via Supabase |
| **AI/ML** | Python, TensorFlow, OpenCV |
| **Push Notifications** | Firebase Cloud Messaging |
| **Charts & Analytics** | Chart.js, Recharts |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Python](https://www.python.org/) 3.8+ (for AI service)
- [Supabase](https://supabase.com/) account (free tier works)
- [Firebase](https://firebase.google.com/) account for push notifications

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ahmedtaha56/poultry-pro.git

# 2. Navigate to the project directory
cd poultry-pro

# 3. Install dependencies
npm install

# 4. Configure environment variables
cp .env.example .env
# Fill in your Supabase URL, Anon Key, and Firebase credentials

# 5. Start the development server
expo start
```

### Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
AI_SERVICE_URL=http://localhost:5000
CHATBOT_API_KEY=your_chatbot_api_key
```

---

## 🗄 Database Schema

Core tables managed via Supabase PostgreSQL:

```
users              — User accounts, roles, authentication
user_profiles      — Extended profile info, farm details
products           — Product catalog (chickens, eggs, feed, equipment)
listings           — Buy/sell marketplace listings
listing_images     — Images for marketplace products
messages           — Direct messages between users
disease_database   — Disease info, symptoms, treatments
disease_detections — AI detection results and history
poultry_guides     — Farming tips, care instructions
news_articles      — Current alerts and updates
user_subscriptions — User notification preferences
ai_training_data   — Images and labels for model training
detection_feedback — User feedback on AI results
```

---

## 🗺 Roadmap

| # | Module | Status |
|---|---|---|
| 1 | **Database Foundation** — users, roles, products, listings, guides | ✅ |
| 2 | **Mobile Authentication** — Login, signup, profile management | ✅ |
| 3 | **Disease Detection** — AI model integration, image upload | ✅ |
| 4 | **Buy/Sell Marketplace** — Listings, search, chat, profiles | ✅ |
| 5 | **Poultry Farming Guide** — Knowledge base, tips, schedules | ✅ |
| 6 | **News & Alerts** — Disease outbreaks, market prices, weather | ✅ |
| 7 | **AI Chatbot** — Query handling, multi-language support | ✅ |
| 8 | **Admin Dashboard** — User management, content moderation | ✅ |
| 9 | **AI Model Training** — Data collection, model retraining pipeline | ✅ |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Ahmed Taha](https://github.com/ahmedtaha56)

⭐ If you find this project useful, please consider giving it a star!

</div>
