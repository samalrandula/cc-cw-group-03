package lk.zalary.vote_service.dto;

import lk.zalary.vote_service.util.VoteType;
import lombok.Data;

@Data
public class VoteRequest {
    private Integer userId;
    private Integer salarySubmissionId;
    private VoteType voteType;
}
