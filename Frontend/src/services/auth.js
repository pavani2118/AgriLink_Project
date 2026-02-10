import { apiPost } from "./api";

export const register = (payload) => apiPost("/api/auth/register", payload);
export const login = (payload) => apiPost("/api/auth/login", payload);
