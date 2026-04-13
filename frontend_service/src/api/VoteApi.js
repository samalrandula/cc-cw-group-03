import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Submit a vote for a salary submission.
 * @param {Object} params
 * @param {number} params.submissionId  - ID of the salary submission
 * @param {"UPVOTE"|"DOWNVOTE"} params.voteType - Vote type (uppercase as expected by API)
 * @returns {{ message: string, voteId: number, submissionId: number, voteType: string }}
 */
export const submitVote = async ({ salarySubmissionId, voteType }) => {
  const token = sessionStorage.getItem("zalary_token");
  const response = await axios.post(
    `${API_BASE}/vote`,
    { salarySubmissionId, voteType },
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );
  return response.data;
};