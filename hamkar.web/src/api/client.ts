import axios from "axios";
import { message } from "antd";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const authEndpoints = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/verify",
  "/api/auth/set-password",
];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      message.error("خطایی رخ داد.");
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = error.config?.url ?? "";

    const isAuthRequest = authEndpoints.some((endpoint) =>
      url.includes(endpoint),
    );

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);