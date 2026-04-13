package lk.zalary.vote_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VoteCountResponse {
    private String message;
    private Long upvoteCount;
    private Long downvoteCount;
}
