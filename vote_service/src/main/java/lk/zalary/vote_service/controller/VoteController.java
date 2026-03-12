package lk.zalary.vote_service.controller;

import lk.zalary.vote_service.dto.VoteCountResponse;
import lk.zalary.vote_service.dto.VoteRequest;
import lk.zalary.vote_service.dto.VoteResponse;
import lk.zalary.vote_service.service.JwtService;
import lk.zalary.vote_service.service.VoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VoteController {
    
    private final VoteService voteService;
    private final JwtService jwtService;
    
    @PutMapping
    public ResponseEntity<VoteResponse> manageVote(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader,
            @RequestBody VoteRequest request) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new VoteResponse("Unauthorized: Missing or invalid token", 0L, 0L, "ERROR")
                );
            }
            
            String token = authorizationHeader.substring("Bearer ".length());
            Integer userId = jwtService.getUserIdFromToken(token);
            
            request.setUserId(userId);
            
            VoteResponse response = voteService.submitVote(request);
            return ResponseEntity.ok(response);
        } catch (io.jsonwebtoken.JwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new VoteResponse("Unauthorized: Invalid or expired token", 0L, 0L, "ERROR")
            );
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
