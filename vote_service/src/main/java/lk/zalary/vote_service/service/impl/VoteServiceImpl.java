package lk.zalary.vote_service.service.impl;

import lk.zalary.vote_service.dto.VoteCountResponse;
import lk.zalary.vote_service.dto.VoteRequest;
import lk.zalary.vote_service.dto.VoteResponse;
import lk.zalary.vote_service.entity.Vote;
import lk.zalary.vote_service.repository.VoteRepository;
import lk.zalary.vote_service.service.VoteService;
import lk.zalary.vote_service.util.VoteType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoteServiceImpl implements VoteService {
    
    private final VoteRepository voteRepository;
    private final RestTemplate restTemplate;
    
    @Value("${vote.approval.threshold:5}")
    private Integer approvalThreshold;
    
    @Value("${salary.submission.service.url:http://localhost:8081}")
    private String salarySubmissionServiceUrl;
    
    @Override
    @Transactional
    public VoteResponse submitVote(VoteRequest request) {
        
        Optional<Vote> existingVote = voteRepository.findByUserIdAndSalarySubmissionId(
            request.getUserId(), 
            request.getSalarySubmissionId()
        );
        
        if (existingVote.isPresent()) {
            throw new IllegalStateException("User has already voted on this submission");
        }
        
        Vote vote = new Vote();
        vote.setUserId(request.getUserId());
        vote.setSalarySubmissionId(request.getSalarySubmissionId());
        vote.setVoteType(request.getVoteType());
        vote.setCreatedAt(LocalDateTime.now());
        
        voteRepository.save(vote);
        log.info("Vote recorded: {} by user {} on submission {}", 
            request.getVoteType(), request.getUserId(), request.getSalarySubmissionId());
        
        Long upvoteCount = voteRepository.countUpvotesBySalarySubmissionId(request.getSalarySubmissionId());
        Long downvoteCount = voteRepository.countDownvotesBySalarySubmissionId(request.getSalarySubmissionId());
        
        String status = "PENDING";
        if (upvoteCount >= approvalThreshold) {
            updateSubmissionStatus(request.getSalarySubmissionId(), "APPROVED");
            status = "APPROVED";
            log.info("Submission {} reached approval threshold and is now APPROVED", request.getSalarySubmissionId());
        }
        
        return new VoteResponse(
            "Vote recorded successfully",
            upvoteCount,
            downvoteCount,
            status
        );
    }
    
    @Override
    public VoteCountResponse getVoteCount(Integer salarySubmissionId) {
        Long upvoteCount = voteRepository.countUpvotesBySalarySubmissionId(salarySubmissionId);
        Long downvoteCount = voteRepository.countDownvotesBySalarySubmissionId(salarySubmissionId);
        
        return new VoteCountResponse(
            "Vote count retrieved",
            upvoteCount,
            downvoteCount
        );
    }
    
    private void updateSubmissionStatus(Integer salarySubmissionId, String status) {
        try {
            String url = salarySubmissionServiceUrl + "/api/submissions/" + salarySubmissionId + "/status?status=" + status;
            restTemplate.put(url, null);
            log.info("Updated submission {} to status {}", salarySubmissionId, status);
        } catch (Exception e) {
            log.error("Failed to update submission status", e);
        }
    }
}
