# Poultry Pro 🐔

**Poultry Pro** is a comprehensive mobile application designed for **small-scale poultry farmers, home poultry keepers, and local shopkeepers**.  
It bridges the gap between traditional poultry practices and modern technology, helping users manage poultry health, buy/sell poultry products, and stay updated with news and alerts.

---

## Features

### 🔹 Client Mobile App
1. **Disease Detection** – Capture/upload chicken images and detect diseases using AI.  
2. **Buy/Sell Platform** – List chickens or poultry items, chat with buyers/sellers, and manage profiles.  
3. **Disease Info & Treatment** – Access symptoms, prevention, and remedies for common poultry illnesses.  
4. **Poultry Farming Guide** – Step-by-step farming tips, equipment info, and care instructions.  
5. **News & Updates** – Receive alerts on disease outbreaks, weather, and market prices.  
6. **AI Chatbot** – Quick answers for poultry-related queries.

### 🔹 Admin Web App
1. **User Activity Monitoring** – Track user interactions and manage listings.  
2. **AI Model Update** – Improve disease detection accuracy using collected data.

---

## Modules

| Module | Description |
|--------|-------------|
| Disease Detection | AI-powered image analysis for chicken health |
| Buy/Sell Platform | Marketplace with chat & product listing management |
| Poultry Guide | Care, hygiene, and farm setup instructions |
| News & Alerts | Real-time updates on disease, weather, and market trends |
| Chatbot | Instant query handling & support |
| Admin Dashboard | User activity, listings, and AI updates |

---

## Tech Stack

- **Frontend:** React Native, Expo  
- **Backend:** Supabase (Auth, Database, Storage)  
- **AI Module:** Python-based disease detection  
- **Notifications:** Firebase push notifications  
- **Data Storage:** Supabase tables for users, products, stock, sales, news  

---

## Architecture

**Three-tier architecture:**

1. **Client Layer (Presentation)** – Mobile app interface for users.  
2. **Application Layer (Logic)** – Backend processing, API requests, AI module.  
3. **Data Layer (Storage)** – Supabase database storing all app data securely.  

![Architecture Diagram](./architecture12.png)

---

## Screenshots

*(Add your project screenshots here)*

---

## Installation

```bash
# Clone repository
git clone https://github.com/ahmedtaha56/poultry-pro.git

# Change directory
cd poultry-pro

# Install dependencies
npm install

# Run project
expo start
