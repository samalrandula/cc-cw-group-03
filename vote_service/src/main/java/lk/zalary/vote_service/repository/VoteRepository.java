package lk.zalary.vote_service.repository;

import lk.zalary.vote_service.entity.Vote;
import lk.zalary.vote_service.util.VoteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Integer> {
    
    Optional<Vote> findByUserIdAndSalarySubmissionId(Integer userId, Integer salarySubmissionId);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.salarySubmissionId = :salarySubmissionId AND v.voteType = lk.zalary.vote_service.util.VoteType.UPVOTE")
    Long countUpvotesBySalarySubmissionId(Integer salarySubmissionId);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.salarySubmissionId = :salarySubmissionId AND v.voteType = lk.zalary.vote_service.util.VoteType.DOWNVOTE")
    Long countDownvotesBySalarySubmissionId(Integer salarySubmissionId);
}
