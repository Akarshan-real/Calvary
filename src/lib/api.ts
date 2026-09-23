import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to extract clean error messages from Axios responses
export function getApiErrorMessage(error: unknown, fallback = "An unexpected error occurred."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      if ("error" in data) {
        return typeof data.error === "string" ? data.error : data.error?.message || fallback;
      }
      if ("message" in data) {
        return String(data.message);
      }
    }
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export default api;
