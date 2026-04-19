package lk.zalary.search_service.client;

import lk.zalary.search_service.dto.VoteCountResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class VoteServiceClient {

    private final RestTemplate restTemplate;

    @Value("${vote.service.url}")
    private String voteServiceUrl;

    /**
     * Fetch upvote and downvote counts for a salary submission from the vote service.
     * Returns a response with 0 counts if the vote service is unreachable or returns an error.
     */
    public VoteCountResponse getVoteCounts(Integer salarySubmissionId) {
        String url = voteServiceUrl + "/vote/submission/" + salarySubmissionId;
        try {
            VoteCountResponse response = restTemplate.getForObject(url, VoteCountResponse.class);
            if (response != null) {
                return response;
            }
        } catch (Exception e) {
            log.warn("Failed to fetch vote counts for submission {}: {}", salarySubmissionId, e.getMessage());
        }
        VoteCountResponse fallback = new VoteCountResponse();
        fallback.setUpvoteCount(0L);
        fallback.setDownvoteCount(0L);
        return fallback;
    }
}
