import type { Detection, PersonDetails, PersonSummary } from './types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

export function cacheImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return '';
  }

  const safePath = imagePath.split('/').map(encodeURIComponent).join('/');
  return `${API_BASE_URL}/cache/${safePath}`;
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  return response.json() as Promise<T>;
}

export async function fetchDetections(): Promise<Detection[]> {
  const response = await fetch(`${API_BASE_URL}/detections/`);
  return readJson<Detection[]>(response);
}

export async function fetchPersons(): Promise<PersonSummary[]> {
  const response = await fetch(`${API_BASE_URL}/persons/`);
  return readJson<PersonSummary[]>(response);
}

export async function fetchPerson(personId: string): Promise<PersonDetails> {
  const response = await fetch(`${API_BASE_URL}/persons/${personId}`);
  return readJson<PersonDetails>(response);
}

export async function createPerson(name: string, image: File): Promise<unknown> {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('image', image);

  const response = await fetch(`${API_BASE_URL}/persons/`, {
    method: 'POST',
    body: formData,
  });

  return readJson<unknown>(response);
}

export async function addFace(personId: string, image: File): Promise<unknown> {
  const formData = new FormData();
  formData.append('image', image);

  const response = await fetch(`${API_BASE_URL}/persons/${personId}/images`, {
    method: 'POST',
    body: formData,
  });

  return readJson<unknown>(response);
}