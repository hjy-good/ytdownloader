const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || '/api') 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

export interface VideoFormat {
  format_id: string;
  ext: string;
  resolution: string | null;
  filesize: number | null;
  vcodec: string | null;
  acodec: string | null;
}

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  formats: VideoFormat[];
  url: string;
}

export interface DownloadResponse {
  title: string;
  download_url: string;
  filename: string;
}

export const fetchVideoInfo = async (url: string): Promise<VideoInfo> => {
  const response = await fetch(`${API_BASE_URL}/info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch video info');
  }

  return response.json();
};

export const downloadVideo = async (url: string, formatId: string): Promise<DownloadResponse> => {
  const response = await fetch(`${API_BASE_URL}/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, format_id: formatId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to download video');
  }

  return response.json();
};

export const getFullDownloadUrl = (path: string): string => {
  return `${API_BASE_URL}${path}`;
};
