package lk.zalary.report_service.repository;

import lk.zalary.report_service.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Integer> {

	Optional<Report> findByUserIdAndSalarySubmissionId(Integer userId, Integer salarySubmissionId);
}
