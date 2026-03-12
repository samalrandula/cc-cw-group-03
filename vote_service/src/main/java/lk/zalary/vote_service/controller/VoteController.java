package lk.zalary.vote_service.controller;

import lk.zalary.vote_service.dto.VoteCountResponse;
import lk.zalary.vote_service.dto.VoteRequest;
import lk.zalary.vote_service.dto.VoteResponse;
import lk.zalary.vote_service.service.VoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VoteController {
    
    private final VoteService voteService;
    
    @PutMapping
    public ResponseEntity<VoteResponse> manageVote(@RequestBody VoteRequest request) {
        try {
            VoteResponse response = voteService.submitVote(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(
                new VoteResponse(e.getMessage(), 0L, 0L, "ERROR")
            );
        }
    }
    
    @GetMapping("/submission/{salarySubmissionId}")
    public ResponseEntity<VoteCountResponse> getVoteCount(@PathVariable Integer salarySubmissionId) {
        VoteCountResponse response = voteService.getVoteCount(salarySubmissionId);
        return ResponseEntity.ok(response);
    }
}
