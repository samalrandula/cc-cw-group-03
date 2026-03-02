package lk.zalary.stats_service.repository;

import lk.zalary.stats_service.entity.SalarySubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SalarySubmissionRepository extends JpaRepository<SalarySubmission, Long> {

    List<SalarySubmission> findByIsApprovedTrue();

    @Query("SELECT AVG(s.salaryAmount) FROM SalarySubmission s WHERE s.isApproved = true AND s.role = :role")
    Double findAverageSalaryByRole(String role);

    @Query("SELECT COUNT(s) FROM SalarySubmission s WHERE s.isApproved = true")
    Long countApprovedSalaries();
}