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
    
    @Value("${vote.rejection.threshold:3}")
    private Integer rejectionThreshold;
    
    @Value("${salary.submission.service.url:http://localhost:8081}")
    private String salarySubmissionServiceUrl;
    
    @Override
    @Transactional
    public VoteResponse submitVote(VoteRequest request) {
        
        if (request.getVoteType() == null) {
            throw new IllegalArgumentException("Vote type is required");
        }
        
        Optional<Vote> existingVote = voteRepository.findByUserIdAndSalarySubmissionId(
            request.getUserId(), 
            request.getSalarySubmissionId()
        );
        
        String message;
        
        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            if (vote.getVoteType() == request.getVoteType()) {
                voteRepository.delete(vote);
                message = "Vote removed successfully";
                log.info("Vote toggled off: {} removed by user {} on submission {}", 
                    request.getVoteType(), request.getUserId(), request.getSalarySubmissionId());
            } else {
                vote.setVoteType(request.getVoteType());
                vote.setCreatedAt(LocalDateTime.now());
                voteRepository.save(vote);
                message = "Vote changed successfully";
                log.info("Vote changed: to {} by user {} on submission {}", 
                    request.getVoteType(), request.getUserId(), request.getSalarySubmissionId());
            }
        } else {
            Vote vote = new Vote();
            vote.setUserId(request.getUserId());
            vote.setSalarySubmissionId(request.getSalarySubmissionId());
            vote.setVoteType(request.getVoteType());
            vote.setCreatedAt(LocalDateTime.now());
            voteRepository.save(vote);
            message = "Vote recorded successfully";
            log.info("Vote recorded: {} by user {} on submission {}", 
                request.getVoteType(), request.getUserId(), request.getSalarySubmissionId());
        }
        
        Long upvoteCount = voteRepository.countBySalarySubmissionIdAndVoteType(request.getSalarySubmissionId(), VoteType.UPVOTE);
        Long downvoteCount = voteRepository.countBySalarySubmissionIdAndVoteType(request.getSalarySubmissionId(), VoteType.DOWNVOTE);
        
        String status = determineAndUpdateStatus(request.getSalarySubmissionId(), upvoteCount, downvoteCount);
        
        return new VoteResponse(
            message,
            upvoteCount,
            downvoteCount,
            status
        );
    }
    
    @Override
    public VoteCountResponse getVoteCount(Integer salarySubmissionId) {
        Long upvoteCount = voteRepository.countBySalarySubmissionIdAndVoteType(salarySubmissionId, VoteType.UPVOTE);
        Long downvoteCount = voteRepository.countBySalarySubmissionIdAndVoteType(salarySubmissionId, VoteType.DOWNVOTE);
        
        return new VoteCountResponse(
            "Vote count retrieved",
            upvoteCount,
            downvoteCount
        );
    }
    
    private String determineAndUpdateStatus(Integer salarySubmissionId, Long upvoteCount, Long  downvoteCount) {
        String status = "PENDING";
        
        if (upvoteCount >= approvalThreshold) {
            updateSubmissionStatus(salarySubmissionId, "APPROVED");
            status = "APPROVED";
            log.info("Submission {} has approval threshold and is APPROVED", salarySubmissionId);
        } else if (downvoteCount >= rejectionThreshold) {
            updateSubmissionStatus(salarySubmissionId, "REJECTED");
            status = "REJECTED";
            log.info("Submission {} has rejection threshold and is REJECTED", salarySubmissionId);
        } else {
            updateSubmissionStatus(salarySubmissionId, "PENDING");
            status = "PENDING";
            log.info("Submission {} is back to PENDING status", salarySubmissionId);
        }
        
        return status;
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
