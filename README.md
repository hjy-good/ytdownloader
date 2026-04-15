# YT Downloader

A modern, responsive YouTube video downloader built with Next.js and FastAPI.

## Features
-   Extract video metadata (title, thumbnail, formats).
-   Download video/audio in various formats.
-   Responsive UI with Tailwind CSS.

## Tech Stack
-   **Frontend**: Next.js 15+ (App Router), Tailwind CSS 4+, TypeScript.
-   **Backend**: Python 3.x, FastAPI, `yt-dlp`.

## Prerequisites
-   Node.js (v18+) and npm.
-   Python (v3.10+) and pip.
-   **FFmpeg**: Required by `yt-dlp` for certain format conversions and merging.

## Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Unix/macOS
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
The backend will run on `http://localhost:8000`.

### 2. Frontend Setup
```bash
# In the root directory
npm install
npm run dev
```
The frontend will run on `http://localhost:3000`.

## Architecture Rules
-   FastAPI handles all interactions with `yt-dlp`.
-   Next.js communicates with FastAPI via defined API routes in `lib/api.ts`.
-   Downloaded files are served as static files from the FastAPI backend.

## Environment Variables
-   `NEXT_PUBLIC_API_URL`: Backend API base URL (default: `http://localhost:8000`).
