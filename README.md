# 🎯 Let'sAgree

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)  
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)  
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev/)  
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-336791.svg)](https://www.postgresql.org/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)  
[![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7.svg)](https://render.com/)  

> A couple/partner-focused application that helps users find agreement on everyday decisions in a fun, swipeable card format. Users choose a category (movies, restaurants, etc.), input preferences, and take turns swiping on AI-generated recommendations until they reach a consensus.

> It integrates with multiple APIs (OpenAI, Foursquare, TMDB, RAWG, Unsplash) and tracks metrics via PostgreSQL.

---

## 📖 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Development Setup](#-development-setup)
- [Configuration](#-configuration)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Testing](#-testing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)
- [Project Structure](#-project-structure)

---

## ✨ Features
- 🔑 Rate limiting with tier-based access
- 📊 Metrics tracking in Postgres:
  - API request counts
  - 429 error counts
  - Category usage
  - User interactions
- 🎨 React frontend for user interaction
- ⚡ Express backend with logging (Winston)
- ☁️ Fully deployed on Render
- 🌐 Integrates multiple APIs:
  - Foursquare (images)
  - Unsplash (images)
  - TMDB (images)
  - RAWG (images)
  - OpenAI (result generation)
- Transforms AI responses by adhering to schemas, sanitizing output, validating output, attaching additional data with APIs, and formating the final output for the client in a multi-part logical stream

---

## 🛠 Tech Stack
- **Backend:** Node.js, Express, TypeScript  
- **Frontend:** React + Vite  
- **Database:** PostgreSQL (Render free tier, 1GB storage)  
- **Logging:** Winston  
- **Deployment:** Render (Web Service + PostgreSQL)  
- **External APIs:** OpenAI, Foursquare, Unsplash, TMDB, RAWG  

---

## ⚙️ Development Setup

```bash
git clone https://github.com/your-username/letsagree.git
cd letsagree

npm install
```

Generate a .env file for the /server and /frontend. Follow the format in the Configuration section

Start the development servers:

```bash
# Backend
cd /Let-sAgree
npx ts-node server/index.ts

# Frontend
cd /Let-sAgree/frontend
npm run dev
```

## 🔧 Configuration

Set these environment variables in your .env:

```bash
# Backend 
OPENAI_API_KEY=
TMDB_API_KEY=
FSQ_API_KEY=
RAWG_API_KEY=
UNSPLASH_API_KEY=
RATE_LIM_TIER_1_ACCESS_CODE=
RATE_LIM_TIER_2_ACCESS_CODE=
DEV_CORS_URL=
PROD_CORS_URL=
NODE_ENV= # "Production" or "Development"
DATABASE_URL=

# Frontend
VITE_SPECIAL_RATE_TIER_1_LIM_CODE=
VITE_SPECIAL_RATE_TIER_2_LIM_CODE=
VITE_GOOGLE_API_KEY=
VITE_API_BASE_URL= # Empty string to use the proxy in development, filled value for production
```

## 🗄 Database Schema

How to set up External Database in Dev Environment from Render:

Install psql

In terminal, reach database by inputting these commands:

```sql
psql "postgres://<username>:<password>@<host>:5432/<dbname>" /* Obtained from Render External Database URL*/
```

```sql
CREATE TABLE metrics (
    metric_name TEXT PRIMARY KEY,
    value INTEGER DEFAULT 0
);
```

Example insert:

```sql
INSERT INTO metrics (metric_name, value) VALUES
('user_visits', 0),
('card_gen_requests', 0),
('rate_limit_exceeded', 0),
('RAWG_requests', 0),
('FSQ_requests', 0),
('TMDB_requests', 0),
('Unsplash_requests', 0),
('Delivery_requests', 0),
('Restaurants_requests', 0),
('Shows_requests', 0),
('Movies_requests', 0),
('Indoor_Date_Activities_requests', 0),
('Outdoor_Date_Activities_requests', 0),
('Things_To_Do_Nearby_requests', 0),
('Weekend_Trip_Ideas_requests', 0),
('Games_requests', 0);
```

```sql
SELECT * FROM metrics;
```

Metrics are incremented in Express using:

```ts
await incrementMetric(metricFieldName);
```

## 🚀 Deployment
### Backend
Deploy your Express server as a Render Web Service.

Set environment variables (DATABASE_URL, API keys, etc.) in Render's dashboard.

Use ssl: { rejectUnauthorized: false } in production for Postgres connections.

### Database
Use Render's PostgreSQL free tier.

Schema/data persists across server restarts.

Logs are available in Render's dashboard; file-based logs won't persist.

## 🤝 Contributing
1. Fork the project
2. Create your feature branch
```bash
git checkout -b feature/YourFeature
```
3. Commit changes
```bash
git commit -m "Add some feature"
```
4. Push to branch
```bash
git push origin feature/YourFeature
```
5. Open a Pull Request

## ✅ Testing
```bash
npm test
```

## 📄 License
This project is proprietary. All rights reserved.

## 🙏 Acknowledgements
- OpenAI API
- Foursquare API
- Unsplash API
- TMDB API
- RAWG API
- Render

## 📂 Project Structure

```
/frontend                    # React app (Vite)
  /.env                      # Frontend environment variables
  /src
    /components              # React components
      /Card.jsx              # Individual card component
      /CardGeneration.jsx    # Card generation container
      /CardStack.jsx         # Swipeable card stack
      /Category.jsx          # Category selection
      /FAQ.jsx               # FAQ section
      /InputPrompt.jsx       # User input form
      ...
    /component-styles        # CSS files for components
      ...
    /images                  # Static image assets
      ...
    /utils                   # Frontend utility functions
      ...
  /vite.config.js            # Vite configuration

/server                      # Express backend (TypeScript)
  /.env                      # Backend environment variables
  /ai                        # AI processing pipeline
    /categories-card-generation.ts  # Generate cards for each category
    /pre-process.ts                 # Input preprocessing
  /config                    # Server configuration
  /controllers               # API route controllers
    /prompt-input-controller.ts    # Handle user prompts
  /data                      # Static data
    /categories.json         # Category definitions
  /logger                    # Logging configuration
    ...
  /middleware                # Express middleware
  /models                    # Data models for different card types
    /restaurant-card.ts      # Restaurant schema
    /movie-card.ts           # Movie schema
    /game-card.ts            # Game schema
    /show-card.ts            # TV show schema
    /prompt-input.ts         # User input schema
    ...
  /routes                    # API route definitions
    /prompt-input.ts         # Prompt input routes
  /utils                     # Utility functions
    /img-retrieval.ts        # Image fetching from APIs
    /validation-ai-output.ts # Validate AI responses
    /fallbacks-ai-output.ts. # Apply fallbacks to AI responses
  /index.ts                  # Server entry point
```

