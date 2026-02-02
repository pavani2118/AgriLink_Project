import { apiGet, apiPut } from "./api";

export const getMyProfile = () => apiGet("/api/users/me");
export const updateMyProfile = (payload) => apiPut("/api/users/me", payload);
