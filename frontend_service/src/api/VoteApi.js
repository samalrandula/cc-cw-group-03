import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetch the current user's vote status for a salary submission.
 * Called immediately when the vote modal opens.
 * @param {number} salarySubmissionId
 * @returns {{ message: string, userVoteStatus: "UPVOTE" | "DOWNVOTE" | "NONE" }}
 */
export const fetchVoteStatus = async (salarySubmissionId) => {
  const token = sessionStorage.getItem("zalary_token");
  const response = await axios.get(
    `${API_BASE}/submission/${salarySubmissionId}`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );
  return response.data; // { message, userVoteStatus }
};

/**
 * Submit a vote for a salary submission.
 * @param {Object} params
 * @param {number} params.salarySubmissionId  - ID of the salary submission
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