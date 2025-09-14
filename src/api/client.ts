import { Zodios } from "@zodios/core";
import { endpoints } from "./schemas";

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:8010'

export const client = new Zodios(baseURL, endpoints, {
  axiosConfig: { withCredentials: true }
});
