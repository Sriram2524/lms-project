import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail?.errors && Array.isArray(detail.errors))
    return detail.errors
      .map((e) => (e && typeof e.message === "string" ? e.message : JSON.stringify(e)))
      .join(" ");
  if (detail && typeof detail.message === "string") return detail.message;
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
