package lk.zalary.search_service.repository;

import lk.zalary.search_service.entity.Salary;
import lk.zalary.search_service.entity.ExperienceLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import lk.zalary.search_service.dto.VoteCountProjection;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SalaryRepository extends JpaRepository<Salary, Integer> {

    @Query(value = "SELECT v.salary_submission_id as salaryId, " +
            "COALESCE(SUM(CASE WHEN v.vote_type = 'UPVOTE' THEN 1 ELSE 0 END), 0) as upvoteCount, " +
            "COALESCE(SUM(CASE WHEN v.vote_type = 'DOWNVOTE' THEN 1 ELSE 0 END), 0) as downvoteCount " +
            "FROM votes v WHERE v.salary_submission_id IN (:salaryIds) " +
            "GROUP BY v.salary_submission_id", nativeQuery = true)
    List<VoteCountProjection> findVoteCountsBySalaryIds(@Param("salaryIds") List<Integer> salaryIds);

    @Query(value = "SELECT v.salary_submission_id as salaryId, " +
            "COALESCE(SUM(CASE WHEN v.vote_type = 'UPVOTE' THEN 1 ELSE 0 END), 0) as upvoteCount, " +
            "COALESCE(SUM(CASE WHEN v.vote_type = 'DOWNVOTE' THEN 1 ELSE 0 END), 0) as downvoteCount " +
            "FROM votes v WHERE v.salary_submission_id = :salaryId " +
            "GROUP BY v.salary_submission_id", nativeQuery = true)
    VoteCountProjection findVoteCountBySalaryId(@Param("salaryId") Integer salaryId);

    @Query("SELECT s FROM Salary s WHERE " +
            "s.status = lk.zalary.search_service.entity.SalaryStatus.APPROVED AND " +
            "CASE WHEN :countries IS NULL THEN true ELSE s.country IN :countries END AND " +
            "CASE WHEN :companies IS NULL THEN true ELSE s.company IN :companies END AND " +
            "CASE WHEN :roles IS NULL THEN true ELSE s.role IN :roles END AND " +
            "CASE WHEN :experienceLevels IS NULL THEN true ELSE s.experienceLevel IN :experienceLevels END AND " +
            "(:salaryMin IS NULL OR s.salary >= :salaryMin) AND " +
            "(:salaryMax IS NULL OR s.salary <= :salaryMax)")
    Page<Salary> searchSalaries(
            @Param("countries") List<String> countries,
            @Param("companies") List<String> companies,
            @Param("roles") List<String> roles,
            @Param("experienceLevels") List<ExperienceLevel> experienceLevels,
            @Param("salaryMin") BigDecimal salaryMin,
            @Param("salaryMax") BigDecimal salaryMax,
            Pageable pageable
    );

    @Query("SELECT DISTINCT s.country FROM Salary s WHERE s.status = lk.zalary.search_service.entity.SalaryStatus.APPROVED ORDER BY s.country")
    List<String> findDistinctCountries();

    @Query("SELECT DISTINCT s.company FROM Salary s WHERE s.status = lk.zalary.search_service.entity.SalaryStatus.APPROVED ORDER BY s.company")
    List<String> findDistinctCompanies();

    @Query("SELECT DISTINCT s.role FROM Salary s WHERE s.status = lk.zalary.search_service.entity.SalaryStatus.APPROVED ORDER BY s.role")
    List<String> findDistinctRoles();

    @Query("SELECT DISTINCT s.experienceLevel FROM Salary s WHERE s.status = lk.zalary.search_service.entity.SalaryStatus.APPROVED ORDER BY s.experienceLevel")
    List<ExperienceLevel> findDistinctExperienceLevels();
}