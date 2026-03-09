package lk.zalary.vote_service.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class VoteRequest {
    private UUID userId;
    private Integer submissionId;
    private String voteType;
}
