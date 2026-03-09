package lk.zalary.vote_service.repository;

import lk.zalary.vote_service.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<Vote, UUID> {
    
    Optional<Vote> findByUserIdAndSubmissionId(UUID userId, Integer submissionId);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.submissionId = :submissionId AND v.voteType = 'upvote'")
    Long countUpvotesBySubmissionId(Integer submissionId);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.submissionId = :submissionId AND v.voteType = 'downvote'")
    Long countDownvotesBySubmissionId(Integer submissionId);
}
