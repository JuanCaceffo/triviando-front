import axios, { AxiosInstance } from 'axios';
import { parseCookies } from 'nookies';

const DEFAULT_API_URL = 'http://localhost:8080';

export const getApiBaseUrl = (): string => {
  const isServer = typeof window === 'undefined';
  const host = isServer
    ? (process.env.API_URL_SERVER ?? DEFAULT_API_URL)
    : (process.env.NEXT_PUBLIC_API_URL_CLIENT ?? DEFAULT_API_URL);
  return `${host}/api/v1`;
};

export const getAuthToken = (): string | null => {
  const cookies = parseCookies();
  return cookies['token'] ?? null;
};

export class BaseService {
  protected readonly axiosService: AxiosInstance;

  constructor() {
    this.axiosService = axios.create({
      baseURL: getApiBaseUrl(),
      withCredentials: true, // por si usás cookies HttpOnly
    });

    // Interceptor para agregar el token dinámicamente en cada request
    this.axiosService.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }
}
