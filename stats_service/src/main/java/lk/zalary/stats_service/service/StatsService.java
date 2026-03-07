package lk.zalary.stats_service.service;

import lk.zalary.stats_service.dto.StatsResponse;
import lk.zalary.stats_service.model.SalarySubmission;
import lk.zalary.stats_service.repository.SalaryRepository;
import org.springframework.stereotype.Service;

//import java.util.Comparator;
import java.util.List;

@Service
public class StatsService {

    private final SalaryRepository salaryRepository;

    public StatsService(SalaryRepository salaryRepository) {
        this.salaryRepository = salaryRepository;
    }

    public StatsResponse getStats(String role, String country) {

        List<SalarySubmission> salaries =
                salaryRepository.findByRoleAndCountryAndStatus(
                        role,
                        country,
                        "approved"
                );

        int count = salaries.size();

        double average = salaries.stream()
                .mapToInt(SalarySubmission::getSalary)
                .average()
                .orElse(0);

        List<Integer> sorted = salaries.stream()
                .map(SalarySubmission::getSalary)
                .sorted()
                .toList();

        double median = 0;

        if(count > 0){
            if(count % 2 == 0){
                median = (sorted.get(count/2 - 1) + sorted.get(count/2)) / 2.0;
            }else{
                median = sorted.get(count/2);
            }
        }

        return new StatsResponse(average, median, count);
    }
}