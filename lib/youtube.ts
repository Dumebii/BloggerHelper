import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Extract video ID from YouTube URLs
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)(?:[&?]|$)/,
    /youtube\.com\/embed\/([\w-]+)/,
    /youtube\.com\/v\/([\w-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Fetch transcript for a YouTube video
 */
export async function getYouTubeTranscript(videoId: string): Promise<string | null> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcript || transcript.length === 0) return null;
    // Combine all text chunks into one string
    return transcript.map(item => item.text).join(' ');
  } catch (error) {
    console.error(`Failed to fetch YouTube transcript for ${videoId}:`, error);
    return null;
  }
}