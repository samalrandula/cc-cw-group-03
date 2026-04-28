package lk.zalary.vote_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VoteResponse {
    private String message;
    private Long upvoteCount;
    private Long downvoteCount;
    private String submissionStatus;
    /** UPVOTE, DOWNVOTE, or NONE if the user has no vote on this submission. */
    private String userVoteStatus;
}
