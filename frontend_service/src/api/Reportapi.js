import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const REPORT_REASONS = [
  "Fake / test entry",
  "Incorrect salary range",
  "Wrong company or role",
  "Duplicate entry",
  "Other",
];

/**
 * Submit a report for a salary entry.
 * @param {Object} params
 * @param {number} params.submissionId
 * @param {string} params.reason        - One of REPORT_REASONS
 * @param {string} [params.comment]     - Optional free-text comment
 */
export const submitReport = async ({ submissionId, reason, comment }) => {
  const token = sessionStorage.getItem("zalary_token");
  const response = await axios.post(
    `${API_BASE}/report`,
    { submissionId, reason, comment: comment || undefined },
    { headers: { Authorization: token ? `Bearer ${token}` : "" } }
  );
  return response.data;
};

export { REPORT_REASONS };