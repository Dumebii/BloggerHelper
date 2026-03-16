export const uploadLargeAsset = async (file: File): Promise<string> => {
  const safeContentType = file.type || 'application/octet-stream';

  const presignedRes = await fetch('/api/upload/presigned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, contentType: safeContentType }),
  });

  if (!presignedRes.ok) throw new Error('Failed to fetch presigned URL.');
  const { signedUrl, publicUrl } = await presignedRes.json();

  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': safeContentType },
    body: file, 
  });

  if (!uploadRes.ok) throw new Error('Failed to upload.');
  return publicUrl;
};