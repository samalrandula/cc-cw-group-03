import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetch salary stats from the backend.
 * @param {Object} filters
 * @param {string} [filters.location]        - Country name
 * @param {string} [filters.role]            - Role text (free-form)
 * @param {string} [filters.experienceLevel] - One of INTERN | JUNIOR | MID | SENIOR | LEAD
 * @returns {{ averageSalary: number, medianSalary: number, count: number }}
 */
export const fetchStats = async ({ location, role, experienceLevel } = {}) => {
  const params = new URLSearchParams();
  if (location)        params.set("location", location);
  if (role)            params.set("role", role);
  if (experienceLevel) params.set("experienceLevel", experienceLevel);

  const query = params.toString();
  const response = await axios.get(`${API_BASE}/stats${query ? `?${query}` : ""}`);
  return response.data; // { averageSalary, medianSalary, count }
};