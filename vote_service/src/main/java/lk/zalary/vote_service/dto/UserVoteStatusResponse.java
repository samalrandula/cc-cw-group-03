package lk.zalary.vote_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserVoteStatusResponse {
    private String message;
    /** UPVOTE, DOWNVOTE, or NONE if the user has no vote on this submission. */
    private String userVoteStatus;
}
