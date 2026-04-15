import os
import uuid
import yt_dlp
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# CORS settings for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to store downloads
DOWNLOADS_DIR = "downloads"
if not os.path.exists(DOWNLOADS_DIR):
    os.makedirs(DOWNLOADS_DIR)

# Mount static files to serve downloads
app.mount("/static", StaticFiles(directory=DOWNLOADS_DIR), name="static")

class VideoURL(BaseModel):
    url: str

class DownloadRequest(BaseModel):
    url: str
    format_id: Optional[str] = "best"

@app.get("/")
async def root():
    return {"message": "YouTube Downloader API is running"}

import asyncio

@app.post("/info")
async def get_info(request: VideoURL):
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'format': 'best'
    }
    
    def extract_info():
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(request.url, download=False)
            
    try:
        loop = asyncio.get_event_loop()
        info = await loop.run_in_executor(None, extract_info)
        
        formats = []
        for f in info.get('formats', []):
            if f.get('ext') in ['mp4', 'm4a', 'webm']:
                formats.append({
                    'format_id': f.get('format_id'),
                    'ext': f.get('ext'),
                    'resolution': f.get('resolution') or f.get('format_note'),
                    'filesize': f.get('filesize') or f.get('filesize_approx'),
                    'vcodec': f.get('vcodec'),
                    'acodec': f.get('acodec')
                })

        return {
            'title': info.get('title'),
            'thumbnail': info.get('thumbnail'),
            'duration': info.get('duration'),
            'uploader': info.get('uploader'),
            'formats': formats,
            'url': request.url
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/download")
async def download_video(request: DownloadRequest):
    filename_prefix = str(uuid.uuid4())
    outtmpl = os.path.join(DOWNLOADS_DIR, f"{filename_prefix}_%(title)s.%(ext)s")
    
    ydl_opts = {
        'format': request.format_id or 'best',
        'outtmpl': outtmpl,
        'quiet': True,
        'no_warnings': True,
    }

    def run_download():
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=True)
            return info
    
    try:
        loop = asyncio.get_event_loop()
        info = await loop.run_in_executor(None, run_download)
        
        actual_filename = None
        for f in os.listdir(DOWNLOADS_DIR):
            if f.startswith(filename_prefix):
                actual_filename = f
                break
        
        if not actual_filename:
            raise Exception("Failed to find downloaded file")

        return {
            "title": info.get('title'),
            "download_url": f"/static/{actual_filename}",
            "filename": actual_filename
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
