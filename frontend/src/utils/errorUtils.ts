import axios from 'axios';

/**
 * Human-friendly error message extractor.
 * Strips technical HTTP status codes (e.g. 502, 500, 404) and converts them
 * into clear, actionable, user-friendly sentences.
 */
export function extractErrorMessage(error: unknown, fallbackMessage = 'An unexpected error occurred. Please try again.'): string {
  if (!error) return fallbackMessage;

  // If a string is passed, check if it's a raw status code string
  if (typeof error === 'string') {
    return cleanRawErrorString(error, fallbackMessage);
  }

  if (axios.isAxiosError(error)) {
    // 1. Check for backend-provided error message in response body
    const data = error.response?.data;
    if (data) {
      if (typeof data.message === 'string' && data.message.trim().length > 0) {
        return cleanRawErrorString(data.message.trim(), fallbackMessage);
      }
      if (Array.isArray(data.message) && data.message.length > 0) {
        return data.message.join(', ');
      }
      if (typeof data.error === 'string' && data.error.trim().length > 0) {
        return cleanRawErrorString(data.error.trim(), fallbackMessage);
      }
    }

    // 2. Handle HTTP Status Codes with friendly human messages (Never raw status numbers!)
    const status = error.response?.status;
    if (status) {
      switch (status) {
        case 502:
          return 'Server is temporarily unreachable. Please ensure the backend server is running.';
        case 503:
          return 'Service is temporarily unavailable. Please try again in a few moments.';
        case 504:
          return 'Server took too long to respond. Please check your network connection.';
        case 500:
          return 'Server encountered an unexpected error. Please verify backend logs.';
        case 404:
          return 'The requested record or endpoint was not found.';
        case 409:
          return 'A record with these details already exists in your directory.';
        case 400:
        case 422:
          return 'Invalid form details submitted. Please check the entered fields.';
        case 401:
        case 403:
          return 'Access denied. You do not have permission for this action.';
      }
    }

    // 3. Network or Timeout errors
    if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      return 'Request timed out. Please check your connection.';
    }

    if (error.message === 'Network Error' || !error.response) {
      return 'Network connection failed. Please ensure your backend server is running and reachable.';
    }

    return cleanRawErrorString(error.message, fallbackMessage);
  }

  if (error instanceof Error) {
    return cleanRawErrorString(error.message, fallbackMessage);
  }

  return fallbackMessage;
}

/**
 * Strips raw "Request failed with status code XXX" strings and replaces them with user-facing messages
 */
function cleanRawErrorString(msg: string, fallback: string): string {
  if (!msg || typeof msg !== 'string') return fallback;

  // Check if message is a raw status code error
  const match = msg.match(/Request failed with status code\s*(\d+)/i);
  if (match && match[1]) {
    const code = parseInt(match[1], 10);
    switch (code) {
      case 502:
        return 'Server is temporarily unreachable. Please ensure the backend server is running.';
      case 503:
        return 'Service is currently unavailable. Please try again shortly.';
      case 504:
        return 'Server took too long to respond. Please try again.';
      case 500:
        return 'Server encountered an internal error. Please try again.';
      case 404:
        return 'The requested item was not found.';
      case 409:
        return 'A record with these details already exists.';
      default:
        return 'Unable to complete request. Please try again.';
    }
  }

  // Strip technical Axios prefixes if present
  if (msg.startsWith('AxiosError: ')) {
    return cleanRawErrorString(msg.replace('AxiosError: ', ''), fallback);
  }

  return msg;
}
