import { getApiUrl } from '../config/api.config';

export const getDocumentThumbnail = async (documentId: number): Promise<string> => {
  try {
    const response = await fetch(`${getApiUrl('/paperless')}/documents/${documentId}/thumb`, {
      credentials: 'include',
      headers: {
        'Accept': 'image/webp'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch document thumbnail');
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl;
  } catch (error) {
    console.error('Error fetching document thumbnail:', error);
    throw error;
  }
}; 