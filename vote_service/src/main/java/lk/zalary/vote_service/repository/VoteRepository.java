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
    
    Long countBySalarySubmissionIdAndVoteType(Integer salarySubmissionId, VoteType voteType);
}
