package lk.zalary.stats_service.service;

import lk.zalary.stats_service.repository.SalarySubmissionRepository;
import org.springframework.stereotype.Service;

@Service
public class StatsService {

    private final SalarySubmissionRepository repository;

    public StatsService(SalarySubmissionRepository repository) {
        this.repository = repository;
    }

    public Double getAverageSalaryByRole(String role) {
        return repository.findAverageSalaryByRole(role);
    }

    public Long getTotalApprovedSubmissions() {
        return repository.countApprovedSalaries();
    }

}