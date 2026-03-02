package lk.zalary.stats_service.controller;

import lk.zalary.stats_service.service.StatsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/average/{role}")
    public Double getAverageSalary(@PathVariable String role) {
        return statsService.getAverageSalaryByRole(role);
    }

    @GetMapping("/count")
    public Long getTotalApprovedSubmissions() {
        return statsService.getTotalApprovedSubmissions();
    }
}