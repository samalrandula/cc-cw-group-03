package lk.zalary.vote_service.controller;

import jakarta.validation.Valid;
import lk.zalary.vote_service.dto.UserVoteStatusResponse;
import lk.zalary.vote_service.dto.VoteCountResponse;
import lk.zalary.vote_service.dto.VoteRequest;
import lk.zalary.vote_service.dto.VoteResponse;
import lk.zalary.vote_service.service.VoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vote")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    /**
     * Called by BFF with a trusted userId (BFF validates JWT with Identity).
     */
    @PostMapping
    public ResponseEntity<VoteResponse> submitVote(@Valid @RequestBody VoteRequest request) {
        try {
            VoteResponse response = voteService.submitVote(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new VoteResponse(e.getMessage(), 0L, 0L, "ERROR", "NONE")
            );
        }
    }

    @GetMapping("/submission/{salarySubmissionId}")
    public ResponseEntity<VoteCountResponse> getVoteCount(@PathVariable Integer salarySubmissionId) {
        VoteCountResponse response = voteService.getVoteCount(salarySubmissionId);
        return ResponseEntity.ok(response);
    }

    /**
     * Trusted caller (e.g. BFF) supplies userId explicitly — no JWT in this service.
     */
    @GetMapping("/submission/{salarySubmissionId}/user/{userId}")
    public ResponseEntity<UserVoteStatusResponse> getUserVoteStatus(
            @PathVariable Integer salarySubmissionId,
            @PathVariable Long userId) {
        UserVoteStatusResponse response = voteService.getUserVoteStatus(userId, salarySubmissionId);
        return ResponseEntity.ok(response);
    }
}
