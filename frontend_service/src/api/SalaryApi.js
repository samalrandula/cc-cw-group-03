import axios from "axios";

const API_BASE = window.env.VITE_API_BASE_URL;
const EXCHANGE_API = window.env.VITE_EXCHANGE_API;
const COUNTRIES_API = window.env.VITE_COUNTRIES_API;
const JOB_ROLES_API = window.env.VITE_JOB_ROLES_API;

// ✅ Submit salary to backend
export const submitSalary = async (salaryData) => {
  const response = await axios.post(`${API_BASE}/submit`, salaryData);
  return response.data;
};

// ✅ Fetch paginated + filtered salaries
// Params: { page, pageSize, countries, companies, roles, levels }
export const fetchSalaries = async ({ page = 0, pageSize = 10, countries, companies, roles, levels } = {}) => {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("pageSize", pageSize);
  if (countries) params.set("countries", countries);
  if (companies) params.set("companies", companies);
  if (roles)     params.set("roles", roles);
  if (levels)    params.set("levels", levels);

  const response = await axios.get(`${API_BASE}/search?${params.toString()}`);
  return response.data;
  // Returns: { salaries, totalCount, totalPages, currentPage, pageSize }
};

// ✅ Fetch currencies from external API
export const fetchCurrencies = async () => {
  try {
    const res = await axios.get(EXCHANGE_API);
    return Object.keys(res.data.rates).sort();
  } catch (error) {
    console.error("Failed to fetch currencies", error);
    return ["LKR", "USD"];
  }
};

// ✅ Fetch countries from external API
export const fetchCountries = async () => {
  try {
    const res = await axios.get(COUNTRIES_API);
    const countries = res.data
      .map((c) => c.name.common)
      .sort((a, b) => a.localeCompare(b));
    return countries;
  } catch (error) {
    console.error("Failed to fetch countries", error);
    return ["Sri Lanka", "United States"];
  }
};

// ✅ Fetch job role suggestions filtered by a search term
// - Only called when search.length >= 3
// - Passes `search` as a query param (forwarded to any backend that supports it)
// - Falls back to client-side filtering for static/demo endpoints
export const fetchJobRoles = async (search = "") => {
  try {
    const params = new URLSearchParams();
    if (search) params.set("search", search);

   const res = await axios.get(`${JOB_ROLES_API}?${params.toString()}`);

    const roles = res.data["job-titles"];

    if (Array.isArray(roles)) {
      return roles
        .filter((role) => role.toLowerCase().includes(search.toLowerCase()))
        .map((role) =>
              role.replace(/\b\w/g, (char) => char.toUpperCase())
        );
    }
  } catch (error) {
    console.error("Failed to fetch job roles", error);
  }

  return [];
};