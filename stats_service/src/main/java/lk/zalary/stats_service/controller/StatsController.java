package lk.zalary.stats_service.controller;

import lk.zalary.stats_service.dto.StatsResponse;
import lk.zalary.stats_service.service.StatsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping
    public StatsResponse getStats(
            @RequestParam String role,
            @RequestParam String country
    ){
        return statsService.getStats(role,country);
    }
}