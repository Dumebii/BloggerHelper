export const uploadLargeAsset = async (file: File, authToken?: string): Promise<string> => {
  const safeContentType = file.type || 'application/octet-stream';

  const presignedRes = await fetch('/api/upload/presigned', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
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

export async function uploadBase64Image(base64Data: string): Promise<string> {
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  const matches = base64Data.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
  if (!matches) throw new Error("Invalid base64 image data");
  const mimeType = `image/${matches[1]}`;
  const base64 = matches[2];
  // Convert base64 to binary using browser APIs (no Node.js Buffer)
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  const file = new File([blob], `image-${Date.now()}.${matches[1]}`, { type: mimeType });
  return await uploadLargeAsset(file);
}