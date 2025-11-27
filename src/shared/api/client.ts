import { Zodios } from "@zodios/core";
import { endpoints } from "./schemas";

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:8010'

export const client = new Zodios(apiBaseUrl, endpoints, {
  axiosConfig: { withCredentials: true, baseURL: apiBaseUrl }
});
