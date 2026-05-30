# 🛡️ CyberSentinel — Backend API

> AI-Powered Cyber Threat Intelligence Platform  
> **Web Data UNLOCKED Hackathon** | Bright Data × lablab.ai | Track: Security & Compliance

---

## ⚡ QUICK START (5 minutes)

### Prerequisites — Install these first

| Tool | Download | Check installed |
|------|----------|----------------|
| Python 3.11+ | https://python.org/downloads | `python --version` |
| MongoDB | https://mongodb.com/try/download/community | `mongosh --version` |
| Redis | See below | `redis-cli ping` |
| Node.js 20+ | https://nodejs.org (for frontend) | `node --version` |

**Install Redis:**
- Mac: `brew install redis && brew services start redis`
- Windows: Download from https://github.com/tporadowski/redis/releases → run `redis-server`
- Linux: `sudo apt install redis-server && sudo systemctl start redis`

---

## 📁 FOLDER STRUCTURE

```
cybersentinel_backend/
├── app/
│   ├── main.py                  ← FastAPI entry point
│   ├── config.py                ← Reads .env settings
│   ├── api/routes/
│   │   ├── analyze.py           ← POST /api/v1/analyze/url
│   │   ├── threats.py           ← GET  /api/v1/threats
│   │   ├── dashboard.py         ← GET  /api/v1/dashboard/stats
│   │   ├── monitor.py           ← POST /api/v1/monitor/hunt
│   │   ├── credentials.py       ← POST /api/v1/credentials/scan
│   │   └── alerts.py            ← GET/POST /api/v1/alerts/*
│   ├── agents/
│   │   ├── phishing_detector.py ← Main URL analysis pipeline
│   │   └── threat_hunter.py     ← Autonomous monitoring agent
│   ├── bright_data/
│   │   ├── serp_client.py       ← Bright Data SERP API
│   │   ├── web_unlocker.py      ← Bright Data Web Unlocker
│   │   ├── scraping_browser.py  ← Bright Data Scraping Browser
│   │   └── web_scraper_api.py   ← Bright Data Web Scraper API
│   ├── ai/
│   │   ├── openai_client.py     ← GPT-4 wrapper
│   │   └── prompts.py           ← All AI prompts
│   ├── core/
│   │   └── feature_extractor.py ← URL + HTML security features
│   └── db/
│       ├── mongodb.py           ← MongoDB connection
│       └── redis_client.py      ← Redis connection + feed
├── requirements.txt
├── .env.example                 ← COPY THIS TO .env
└── Dockerfile
```

---

## 🔧 STEP-BY-STEP SETUP

### Step 1 — Create your .env file

```bash
# In the cybersentinel_backend/ folder:
cp .env.example .env
```

Now open `.env` in VS Code and fill in your values:

```env
# ── REQUIRED for full functionality ──────────────────────────────

# From https://brightdata.com/cp/zones
BRIGHT_DATA_API_KEY=your_key_here
BRIGHT_DATA_USERNAME=brd-customer-XXXX-zone-XXXX
BRIGHT_DATA_PASSWORD=your_password_here

# From https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-XXXX

# ── Leave as-is if running MongoDB/Redis locally ──────────────────
MONGODB_URI=mongodb://localhost:27017/cybersentinel
REDIS_URL=redis://localhost:6379

# ── Optional: Telegram alerts ────────────────────────────────────
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

> ⚠️ **The app works WITHOUT Bright Data and OpenAI keys** — it uses fallback
> mock data so you can see the UI working immediately. Add real keys for live data.

---

### Step 2 — Create Python virtual environment

```bash
cd cybersentinel_backend

# Create virtual environment
python -m venv venv

# Activate it:
# Mac/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# You should see (venv) at the start of your terminal prompt now
```

### Step 3 — Install dependencies

```bash
pip install -r requirements.txt
```

This takes about 2-3 minutes.

### Step 4 — Install Playwright browser (for Scraping Browser)

```bash
playwright install chromium
```

### Step 5 — Start MongoDB and Redis

Make sure both are running before starting the backend:

```bash
# Check MongoDB is running:
mongosh --eval "db.adminCommand('ping')"
# Should print: { ok: 1 }

# Check Redis is running:
redis-cli ping
# Should print: PONG
```

If either is not running:
- Mac: `brew services start mongodb-community` and `brew services start redis`
- Linux: `sudo systemctl start mongod` and `sudo systemctl start redis`
- Windows: Start them from Services or run the executables

### Step 6 — Start the backend

```bash
# Make sure you are in cybersentinel_backend/ with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
=======================================================
  🛡️  CyberSentinel API Starting...
=======================================================

INFO  - ✅ MongoDB connected
INFO  - ✅ Redis connected
INFO  - ✅ Scheduler running — threat hunt every 15 min

=======================================================
  ✅  CyberSentinel is LIVE
  📖  API Docs → http://localhost:8000/api/docs
=======================================================
```

---

### Step 7 — Start the frontend (separate terminal)

```bash
cd cybersentinel_frontend   # your frontend folder

# Install packages (first time only)
npm install

# Start frontend
npm run dev
```

Open browser: **http://localhost:3000**

---

## ✅ VERIFY EVERYTHING WORKS

Open these URLs in your browser:

| URL | What you should see |
|-----|-------------------|
| http://localhost:8000/health | `{"status":"operational"}` |
| http://localhost:8000/api/docs | Interactive API documentation |
| http://localhost:3000 | CyberSentinel landing page |
| http://localhost:3000/dashboard | Main security dashboard |

### Test the URL analyzer:
1. Go to http://localhost:3000/dashboard/analyze
2. Enter: `https://google.com`
3. Click ANALYZE
4. Should return a SAFE report in ~15-30 seconds

### Test the API directly:
```bash
curl -X POST http://localhost:8000/api/v1/analyze/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```

---

## 🔑 WHERE TO PUT YOUR API KEYS

### Getting Bright Data keys:
1. Sign up at https://brightdata.com
2. Go to **Control Panel → Zones**
3. Create a **Residential** zone → copy Username + Password
4. Create a **SERP API** zone → copy API Key
5. Paste into your `.env` file

### Getting OpenAI key:
1. Sign up at https://platform.openai.com
2. Go to **API Keys** → Create new key
3. Paste as `OPENAI_API_KEY` in `.env`
4. Make sure your account has credits (free tier works)

### Getting Telegram alerts (optional):
1. Message **@BotFather** on Telegram
2. Send `/newbot` → follow prompts → copy the token
3. Create a group, add your bot to it
4. Visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
5. Copy the `chat.id` value
6. Paste both into `.env`

---

## 🌐 DEPLOY FOR JUDGES (Public URL)

### Backend → Render.com (Free)

1. Push this folder to GitHub
2. Go to https://render.com → **New Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `cybersentinel_backend`
   - **Build Command:** `pip install -r requirements.txt && playwright install chromium`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all your `.env` values as **Environment Variables**
6. Click **Deploy** → wait ~5 min
7. You get a URL like: `https://cybersentinel-api.onrender.com`

### Frontend → Vercel (Free)

1. Go to https://vercel.com → **New Project**
2. Import your frontend GitHub repo
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://cybersentinel-api.onrender.com`
4. Deploy → you get: `https://cybersentinel.vercel.app`

---

## 🛠️ WHAT EACH .ENV KEY DOES

| Key | Required? | What happens without it |
|-----|-----------|------------------------|
| `BRIGHT_DATA_API_KEY` | For live data | SERP searches return empty — mock data used |
| `BRIGHT_DATA_USERNAME` | For live data | Web Unlocker bypasses to direct fetch |
| `BRIGHT_DATA_PASSWORD` | For live data | Same as above |
| `OPENAI_API_KEY` | For AI analysis | Returns realistic mock analysis |
| `MONGODB_URI` | Yes | App crashes on startup |
| `REDIS_URL` | Yes | App crashes on startup |
| `TELEGRAM_BOT_TOKEN` | Optional | Telegram alerts skipped silently |
| `TELEGRAM_CHAT_ID` | Optional | Same as above |

---

## 🐞 TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| `ModuleNotFoundError` | Make sure venv is activated: `source venv/bin/activate` |
| `Connection refused` (MongoDB) | Start MongoDB: `brew services start mongodb-community` |
| `Connection refused` (Redis) | Start Redis: `redis-cli ping` then `brew services start redis` |
| `CORS error` in browser | Backend must be running on port 8000 |
| Analysis takes too long | Normal — Bright Data fetch + AI takes 15-30s |
| `playwright install` fails | Run: `playwright install-deps chromium` |
| Port 8000 in use | `lsof -ti:8000 | xargs kill` then restart |

---

## 📡 API ENDPOINTS REFERENCE

| Method | Endpoint | What it does |
|--------|----------|-------------|
| `POST` | `/api/v1/analyze/url` | Analyze a suspicious URL |
| `GET`  | `/api/v1/analyze/report/{id}` | Get saved analysis report |
| `GET`  | `/api/v1/threats` | List all threats (paginated) |
| `GET`  | `/api/v1/threats/feed` | Real-time threat feed |
| `GET`  | `/api/v1/threats/stats` | Threat statistics |
| `GET`  | `/api/v1/dashboard/stats` | Dashboard overview numbers |
| `GET`  | `/api/v1/dashboard/activity` | Recent activity |
| `POST` | `/api/v1/monitor/hunt` | Trigger manual threat hunt |
| `GET`  | `/api/v1/monitor/status` | Monitoring agent status |
| `POST` | `/api/v1/monitor/target` | Add a domain to monitor |
| `GET`  | `/api/v1/monitor/targets` | List monitored targets |
| `DELETE`| `/api/v1/monitor/target/{id}` | Remove a target |
| `POST` | `/api/v1/credentials/scan` | Scan for credential leaks |
| `GET`  | `/api/v1/credentials/breaches` | List found breaches |
| `GET`  | `/api/v1/alerts/config` | Get alert configuration |
| `POST` | `/api/v1/alerts/config` | Save alert configuration |
| `GET`  | `/api/v1/alerts/history` | Alert history |
| `POST` | `/api/v1/alerts/test` | Send test Telegram alert |
| `WS`   | `/ws/threats` | Real-time WebSocket feed |
| `GET`  | `/health` | Health check |
| `GET`  | `/api/docs` | Swagger API documentation |

---

*CyberSentinel v1.0 — Web Data UNLOCKED Hackathon*  
*Built with FastAPI + Bright Data + OpenAI GPT-4*
