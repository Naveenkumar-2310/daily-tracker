import { Configuration, DefaultApi } from '../generated';
import axiosInstance, { API_BASE_URL } from './axiosInstance';

export const apiConfig = new Configuration({
  basePath: API_BASE_URL,
});

/**
 * Singleton instance of OpenAPI generated API client, powered by axiosInstance
 * Matching Tutor AI pattern: `new BoardApi(apiConfig, undefined, axiosInstance)`
 */
export const apiClient = new DefaultApi(apiConfig, undefined, axiosInstance);

export default apiClient;

