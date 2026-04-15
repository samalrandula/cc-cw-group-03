package lk.zalary.stats_service.repository;

import lk.zalary.stats_service.model.SalarySubmission;
import lk.zalary.stats_service.util.ExperienceLevel;
import lk.zalary.stats_service.util.SalaryStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SalaryRepository extends JpaRepository<SalarySubmission, Integer> {

    List<SalarySubmission> findByStatus(SalaryStatus status);

    List<SalarySubmission> findByStatusAndCountry(SalaryStatus status, String country);

    List<SalarySubmission> findByStatusAndCountryAndRole(
            SalaryStatus status,
            String country,
            String role
    );

    List<SalarySubmission> findByStatusAndCountryAndRoleAndExperienceLevel(
            SalaryStatus status,
            String country,
            String role,
            ExperienceLevel experienceLevel
    );

    List<SalarySubmission> findByStatusAndRole(SalaryStatus status, String role);

    List<SalarySubmission> findByStatusAndRoleAndExperienceLevel(
            SalaryStatus status, 
            String role, 
            ExperienceLevel experienceLevel
    );

}