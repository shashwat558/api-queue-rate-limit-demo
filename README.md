

# API Rate Limit + Frontend Queue System

### (Global Queue + Zustand-Based Queue)

This project demonstrates two complementary approaches for creating a **UI-driven API Request Queue** in a front-end application:

1. **A pure global queue system (singleton pattern)**
2. **A Zustand-powered reactive queue store**

Both implementations aim to solve the same real-world problem:

> **“Prevent overlapping API calls and process UI-triggered requests in a controlled, predictable order.”**

---

## Why This Project Exists

Modern UIs can easily trigger the same API multiple times — especially with fast clicks, transitions, or automated operations.  
This leads to:

- duplicated calls  
- race conditions  
- inconsistent UI states  
- unnecessary costs  

This repo shows how to fix that using **two clean queueing strategies**.

---

# Features

- **FIFO request queue** (first in, first out)
- **Serializable UI → API workflow**
- **Optional concurrency limits**
- **Pause / Resume Queue**
- **Retry logic**
- **Queue state visualization**
- **Two implementations: Global & Zustand**
- Works in **Next.js / React**

---

## 🚀 How to Run

Follow these steps to run the **frontend + queue system** locally.

---

### **1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME
cd YOUR_REPO_NAME
```
### Install dependencies
```bash
npm install
```

### Start the development server
```bash
npm run dev
```

Your app will now be available at:
```bash
http://localhost:3000
```

## Optional: Running Backend

### 1. Install Wrangler
```bash
npm install -g wrangler
```
### 2, Login to Cloudflare
```bash
wrangler login
```

### 3. Start local Cloudflare dev server
```bash
wrangler dev
```
The backend will typically run at:
```bash
http://localhost:8787
```

# Architecture Overview

```txt
┌───────────────┐
│ UI Components │
└───────┬───────┘
        │ enqueue(action)
        ▼
            Two Possible Paths
┌──────────────────────────┐   ┌──────────────────────────────┐
│ Global Queue Singleton   │   │ Zustand Queue Store          │
│ - queue[]                │   │ - queue[]                    │
│ - running flag           │   │ - activeRequest              │
│ - internal processor     │   │ - reactive state for UI      │
└───────┬──────────────────┘   └───────┬──────────────────────┘
        │ processes next                 │ auto-process via store
        ▼                                ▼
┌────────────────────────────┐   ┌──────────────────────────────┐
│ API Executor Layer         │   │ API Executor Layer           │
│ - fetch client             │   │ - fetch client               │
│ - error handling           │   │ - retries                    │
└────────────────────────────┘   └──────────────────────────────┘



