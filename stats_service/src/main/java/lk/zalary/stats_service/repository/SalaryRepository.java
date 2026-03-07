package lk.zalary.stats_service.repository;

import lk.zalary.stats_service.model.SalarySubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SalaryRepository extends JpaRepository<SalarySubmission, Long> {

    List<SalarySubmission> findByRoleAndCountryAndStatus(
            String role,
            String country,
            String status
    );
}