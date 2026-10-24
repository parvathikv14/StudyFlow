const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('studyflow_token');
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new ApiError('Cannot reach the API. Check that the backend is running and try again.', 0);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.message || 'The request could not be completed.', response.status, data.errors || []);
  }
  return data;
}

export { API_URL };
