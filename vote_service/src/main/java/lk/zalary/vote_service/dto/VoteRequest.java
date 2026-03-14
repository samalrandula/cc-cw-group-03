package lk.zalary.vote_service.dto;

import jakarta.validation.constraints.NotNull;
import lk.zalary.vote_service.util.VoteType;
import lombok.Data;

@Data
public class VoteRequest {
    private Integer userId;
    
    @NotNull(message = "Salary submission ID is required")
    private Integer salarySubmissionId;
    
    @NotNull(message = "Vote type is required")
    private VoteType voteType;
}
