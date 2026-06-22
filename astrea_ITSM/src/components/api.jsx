// src/api.js
import { API_URL } from "../config/api";

export async function getData(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`);
  return response.json();
}
