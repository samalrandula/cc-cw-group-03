package lk.zalary.stats_service.service;

import lk.zalary.stats_service.dto.StatsResponse;
import lk.zalary.stats_service.model.SalarySubmission;
import lk.zalary.stats_service.repository.SalaryRepository;
import lk.zalary.stats_service.util.ExperienceLevel;
import lk.zalary.stats_service.util.SalaryStatus;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

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

        } else if (location != null && experienceLevel != null) {

            salaries = salaryRepository
                    .findByStatusAndCountryAndExperienceLevel(
                            SalaryStatus.APPROVED,
                            location,
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

        }else if (experienceLevel != null) {

            salaries = salaryRepository
                    .findByStatusAndExperienceLevel(
                            SalaryStatus.APPROVED,
                            experienceLevel
                    );

        } else {

            salaries = salaryRepository
                    .findByStatus(SalaryStatus.APPROVED);
        }

        if (salaries.isEmpty()) {
            return StatsResponse.builder().count(0).build();
        }

        List<BigDecimal> sortedSalaries = salaries.stream()
                .map(SalarySubmission::getSalary)
                .sorted()
                .toList();

        int count = sortedSalaries.size();

        // Basic Stats
        BigDecimal total = sortedSalaries.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        double average = total.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP).doubleValue();
        double min = sortedSalaries.get(0).doubleValue();
        double max = sortedSalaries.get(count - 1).doubleValue();

        // Percentiles
        Map<Integer, Double> percentiles = new HashMap<>();
        percentiles.put(10, calculatePercentile(sortedSalaries, 10));
        percentiles.put(25, calculatePercentile(sortedSalaries, 25));
        percentiles.put(50, calculatePercentile(sortedSalaries, 50)); // Median
        percentiles.put(75, calculatePercentile(sortedSalaries, 75));
        percentiles.put(90, calculatePercentile(sortedSalaries, 90));

        // Experience Breakdown
        Map<String, StatsResponse.ExperienceStats> breakdown = salaries.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getExperienceLevel().name(),
                        Collectors.collectingAndThen(Collectors.toList(), list -> {
                            double avg = list.stream()
                                    .map(SalarySubmission::getSalary)
                                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                                    .divide(BigDecimal.valueOf(list.size()), 2, RoundingMode.HALF_UP)
                                    .doubleValue();
                            return StatsResponse.ExperienceStats.builder()
                                    .average(avg)
                                    .count(list.size())
                                    .build();
                        })
                ));

        return StatsResponse.builder()
                .averageSalary(average)
                .medianSalary(percentiles.get(50))
                .count(count)
                .minSalary(min)
                .maxSalary(max)
                .percentiles(percentiles)
                .experienceBreakdown(breakdown)
                .build();

    }

    private double calculatePercentile(List<BigDecimal> sortedData, double percentile) {
        if (sortedData.isEmpty()) return 0.0;
        int index = (int) Math.ceil(percentile / 100.0 * sortedData.size()) - 1;
        return sortedData.get(Math.max(0, index)).doubleValue();
    }

}