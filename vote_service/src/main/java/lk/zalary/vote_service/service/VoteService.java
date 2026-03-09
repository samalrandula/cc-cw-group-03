package lk.zalary.vote_service.service;

import lk.zalary.vote_service.dto.VoteCountResponse;
import lk.zalary.vote_service.dto.VoteRequest;
import lk.zalary.vote_service.dto.VoteResponse;

public interface VoteService {
    VoteResponse submitVote(VoteRequest request);
    VoteCountResponse getVoteCount(Integer submissionId);
}
