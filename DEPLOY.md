# Deploying LexRwanda

Backend → **Render** (free Python web service)  
Frontend → **Vercel** (free Next.js hosting)

---

## Part 1 — Prepare the repository

Before deploying, the pre-built ChromaDB vector store must be committed so Render can serve it without re-running ingestion.

### 1.1 Allow the vector store to be committed

The default `.gitignore` excludes `data/chroma/`. Remove that exclusion:

```bash
# In backend/.gitignore, delete or comment out this line:
# data/chroma/
```

Open `backend/.gitignore` and remove or comment the `data/chroma/` line.

### 1.2 Commit the vector store

```bash
git add backend/data/chroma/
git commit -m "include pre-built vector store for deployment"
```

> The ChromaDB directory is ~8-10MB — fine for Git and well within Render's free disk.

### 1.3 Push to GitHub

```bash
git push origin main
```

Make sure your repository is **public** (required for the Devpost submission) or at minimum accessible to Render.

---

## Part 2 — Deploy the Backend on Render

### 2.1 Create a Render account

Go to [render.com](https://render.com) and sign up (free). Connect your GitHub account.

### 2.2 Create a new Web Service

1. Click **New → Web Service**
2. Connect your GitHub repository
3. Configure the service:

| Field | Value |
|-------|-------|
| **Name** | `lexrwanda-api` |
| **Root Directory** | `backend` |
| **Environment** | `Python 3` |
| **Region** | Frankfurt (closest to Kigali) |
| **Branch** | `main` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | Free |

### 2.3 Add environment variables

In the Render dashboard, go to **Environment** and add:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (your key) |
| `USE_LOCAL_EMBEDDINGS` | `true` |
| `LOCAL_EMBEDDING_MODEL` | `BAAI/bge-small-en-v1.5` |
| `CHROMA_PERSIST_DIR` | `./data/chroma` |
| `COLLECTION_NAME` | `lexrwanda_legal` |
| `MIN_SIMILARITY_THRESHOLD` | `0.55` |
| `TOP_K_RETRIEVAL` | `5` |
| `CLAUDE_MODEL` | `claude-sonnet-4-6` |

> Do NOT add `VOYAGE_API_KEY` or `OPENAI_API_KEY` — with `USE_LOCAL_EMBEDDINGS=true` they are not needed.

### 2.4 Deploy

Click **Create Web Service**. Render will:
1. Clone your repo
2. Run `pip install -r requirements.txt` (~3-5 min, fastembed downloads the ONNX model)
3. Start the uvicorn server

Once deployed, your backend URL will be:
```
https://lexrwanda-api.onrender.com
```
(or similar — copy the exact URL from the Render dashboard)

### 2.5 Verify the backend

Visit `https://lexrwanda-api.onrender.com/api/health` — you should see:
```json
{"status": "ok"}
```

And `https://lexrwanda-api.onrender.com/docs` to see the interactive API docs.

---

## Part 3 — Update CORS for your Vercel URL

Before deploying the frontend, add your Vercel domain to the backend's allowed origins.

Open `backend/app/main.py` and update the `allow_origins` list:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://lexrwanda.vercel.app",       # your Vercel domain
        "https://lexrwanda-api.onrender.com",  # optional: self-reference
    ],
    ...
)
```

Commit and push — Render will auto-redeploy.

---

## Part 4 — Deploy the Frontend on Vercel

### 4.1 Create a Vercel account

Go to [vercel.com](https://vercel.com) and sign up (free). Connect your GitHub account.

### 4.2 Import the project

1. Click **Add New → Project**
2. Select your GitHub repository
3. Configure the project:

| Field | Value |
|-------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `frontend` |
| **Build Command** | *(leave as default: `npm run build`)* |
| **Output Directory** | *(leave as default: `.next`)* |

### 4.3 Add environment variables

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://lexrwanda-api.onrender.com` |

> Use the exact URL from your Render dashboard (no trailing slash).

### 4.4 Deploy

Click **Deploy**. Vercel will build and publish. Your live URL will be:
```
https://lexrwanda.vercel.app
```

---

## Part 5 — Verify the full stack

1. Open your Vercel URL
2. Click **Ask a Legal Question**
3. Ask: *"What does the Constitution say about freedom of expression?"*
4. You should receive a streamed answer with source citations

If the answer says "no relevant documents were retrieved," check:
- The `data/chroma/` directory was committed to Git (Step 1.1–1.2)
- `CHROMA_PERSIST_DIR=./data/chroma` is set in Render environment variables
- The Render service has finished building (check the Render logs)

---

## Render Free Tier Notes

| Limitation | Impact |
|-----------|--------|
| Service sleeps after 15 min of inactivity | First request after sleep takes ~30s to wake up |
| 512MB RAM | fastembed + ChromaDB fit comfortably |
| Ephemeral disk | Not a problem — ChromaDB is read from the committed Git files |
| 750 hours/month free | Enough for continuous demo availability |

**To avoid cold starts during your demo:** open the backend health URL in your browser 30 seconds before presenting, to wake the service.

```
https://lexrwanda-api.onrender.com/api/health
```

---

## Quick reference: environment variables

### Backend (Render)

```env
ANTHROPIC_API_KEY=sk-ant-...
USE_LOCAL_EMBEDDINGS=true
LOCAL_EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
CHROMA_PERSIST_DIR=./data/chroma
COLLECTION_NAME=lexrwanda_legal
CLAUDE_MODEL=claude-sonnet-4-6
TOP_K_RETRIEVAL=5
MIN_SIMILARITY_THRESHOLD=0.55
CHUNK_SIZE=500
CHUNK_OVERLAP=100
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://lexrwanda-api.onrender.com
```

---

## Optional: render.yaml (Infrastructure as Code)

Create this file at the **repo root** to configure Render automatically:

```yaml
services:
  - type: web
    name: lexrwanda-api
    env: python
    rootDir: backend
    region: frankfurt
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: USE_LOCAL_EMBEDDINGS
        value: "true"
      - key: LOCAL_EMBEDDING_MODEL
        value: "BAAI/bge-small-en-v1.5"
      - key: CHROMA_PERSIST_DIR
        value: "./data/chroma"
      - key: COLLECTION_NAME
        value: "lexrwanda_legal"
      - key: CLAUDE_MODEL
        value: "claude-sonnet-4-6"
      - key: TOP_K_RETRIEVAL
        value: "5"
      - key: MIN_SIMILARITY_THRESHOLD
        value: "0.55"
      - key: ANTHROPIC_API_KEY
        sync: false   # set manually in Render dashboard (never commit API keys)
```

With this file committed, Render detects the config automatically when you connect the repo.
