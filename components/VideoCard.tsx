'use client';

import React, { useState } from 'react';
import { VideoInfo, downloadVideo, getFullDownloadUrl } from '@/lib/api';

interface VideoCardProps {
  info: VideoInfo;
}

const VideoCard: React.FC<VideoCardProps> = ({ info }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState(info.formats[0]?.format_id || 'best');

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await downloadVideo(info.url, selectedFormat);
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = getFullDownloadUrl(response.download_url);
      link.setAttribute('download', response.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError(err.message || 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl w-full mx-auto mt-8 border border-gray-200">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img 
            className="h-48 w-full object-cover md:w-48" 
            src={info.thumbnail} 
            alt={info.title} 
          />
        </div>
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            {info.uploader}
          </div>
          <h2 className="block mt-1 text-lg leading-tight font-medium text-black">
            {info.title}
          </h2>
          <p className="mt-2 text-gray-500">
            Duration: {Math.floor(info.duration / 60)}:{(info.duration % 60).toString().padStart(2, '0')}
          </p>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Select Format</label>
            <select 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              {info.formats.map((f) => (
                <option key={f.format_id} value={f.format_id}>
                  {f.resolution || f.ext} ({f.ext}) - {formatSize(f.filesize)}
                </option>
              ))}
              <option value="best">Best Quality</option>
            </select>
          </div>

          <div className="mt-6">
            <button
              onClick={handleDownload}
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </span>
              ) : 'Download'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
