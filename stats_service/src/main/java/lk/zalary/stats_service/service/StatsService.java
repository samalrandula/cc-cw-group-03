package lk.zalary.stats_service.service;

import lk.zalary.stats_service.dto.StatsResponse;
import lk.zalary.stats_service.model.SalarySubmission;
import lk.zalary.stats_service.repository.SalaryRepository;
import lk.zalary.stats_service.util.ExperienceLevel;
import lk.zalary.stats_service.util.SalaryStatus;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class StatsService {

    private final SalaryRepository salaryRepository;

    public StatsService(SalaryRepository salaryRepository) {
        this.salaryRepository = salaryRepository;
    }

    public StatsResponse getStats(String location, String role, ExperienceLevel experienceLevel) {

        List<SalarySubmission> salaries;

        if (location != null && role != null && experienceLevel != null) {

            salaries = salaryRepository
                    .findByStatusAndCountryAndRoleAndExperienceLevel(
                            SalaryStatus.APPROVED,
                            location,
                            role,
                            experienceLevel
                    );

        } else if (location != null && role != null) {

            salaries = salaryRepository
                    .findByStatusAndCountryAndRole(
                            SalaryStatus.APPROVED,
                            location,
                            role
                    );

        } else if (role != null && experienceLevel != null) {
        
            salaries = salaryRepository
                    .findByStatusAndRoleAndExperienceLevel(
                            SalaryStatus.APPROVED,
                            role,
                            experienceLevel
                    );

        } else if (location != null) {

            salaries = salaryRepository
                    .findByStatusAndCountry(
                            SalaryStatus.APPROVED,
                            location
                    );

        } else if (role != null) {

            salaries = salaryRepository
                    .findByStatusAndRole(
                            SalaryStatus.APPROVED,
                            role
                    );

        } else {

            salaries = salaryRepository
                    .findByStatus(SalaryStatus.APPROVED);
        }

        int count = salaries.size();

        BigDecimal total = salaries.stream()
                .map(SalarySubmission::getSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal average = count > 0
                ? total.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<BigDecimal> sorted = salaries.stream()
                .map(SalarySubmission::getSalary)
                .sorted()
                .toList();

        BigDecimal median = BigDecimal.ZERO;

        if (count > 0) {
            if (count % 2 == 0) {
                BigDecimal first = sorted.get(count / 2 - 1);
                BigDecimal second = sorted.get(count / 2);
                median = first.add(second)
                        .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            } else {
                median = sorted.get(count / 2);
            }
        }

        return new StatsResponse(
                average.doubleValue(),
                median.doubleValue(),
                count
        );
    }
}