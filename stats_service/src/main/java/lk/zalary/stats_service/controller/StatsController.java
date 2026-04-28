package lk.zalary.stats_service.controller;

import lk.zalary.stats_service.dto.StatsResponse;
import lk.zalary.stats_service.service.StatsService;
import lk.zalary.stats_service.util.ExperienceLevel;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping
    public StatsResponse getStats(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) ExperienceLevel experienceLevel
    ) {
        if (location != null) {
        location = URLDecoder.decode(location, StandardCharsets.UTF_8);
        }
        if (role != null) {
            role = URLDecoder.decode(role, StandardCharsets.UTF_8);
        }

        return statsService.getStats(location, role, experienceLevel);
    }
}