package lk.zalary.search_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class VoteCountResponse {
    private String message;
    private Long upvoteCount;
    private Long downvoteCount;
}
