package lk.zalary.salary_submission_service.repository;

import lk.zalary.salary_submission_service.entity.SalarySubmissions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalaryRepository extends JpaRepository<SalarySubmissions, Long> {
}
