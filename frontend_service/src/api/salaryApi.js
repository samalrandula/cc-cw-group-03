import axios from "axios";

// Backend base URL
const API_BASE = "http://localhost:8082";

// ✅ Submit salary to backend
export const submitSalary = async (salaryData) => {
  const response = await axios.post(`${API_BASE}/submit`, salaryData);
  return response.data;
};

// ✅ Fetch currencies from external API
export const fetchCurrencies = async () => {
  try {
    const res = await axios.get("https://open.er-api.com/v6/latest/USD");
    return Object.keys(res.data.rates).sort();
  } catch (error) {
    console.error("Failed to fetch currencies", error);
    // fallback
    return ["LKR", "USD"];
  }
};


export const fetchCountries = async () => {
  try {
    const res = await axios.get("https://restcountries.com/v3.1/all?fields=name");
    const countries = res.data
      .map((c) => c.name.common)
      .sort((a, b) => a.localeCompare(b));
    return countries;
  } catch (error) {
    console.error("Failed to fetch countries", error);
    return ["Sri Lanka", "United States"]; // fallback
  }
};