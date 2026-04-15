package lk.zalary.vote_service.dto;

import jakarta.validation.constraints.NotNull;
import lk.zalary.vote_service.util.VoteType;
import lombok.Data;

/**
 * Inbound shape matches BFF after token validation: submissionId, voteType, userId.
 */
@Data
public class VoteRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Submission ID is required")
    private Long submissionId;

    @NotNull(message = "Vote type is required")
    private VoteType voteType;
}
