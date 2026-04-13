package lk.zalary.bff_service.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class VoteRequest {

    @NotNull(message = "Submission ID is required")
    private Long salarySubmissionId;

    @NotBlank(message = "Vote type is required")
    @Pattern(regexp = "^(UPVOTE|DOWNVOTE)$",
            message = "Vote type must be 'UPVOTE' or 'DOWNVOTE'")
    private String voteType;

    // This field is set by BFF after token validation
    // NOT sent by frontend
    private Long userId;
}