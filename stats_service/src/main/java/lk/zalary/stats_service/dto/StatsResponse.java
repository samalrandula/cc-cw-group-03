package lk.zalary.stats_service.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class StatsResponse {

    private double averageSalary;
    private double medianSalary;
    private int count;
    private Map<Integer, Double> percentiles;
    private Map<String, ExperienceStats> experienceBreakdown;
    private double minSalary;
    private double maxSalary;

    @Data
    @Builder
    public static class ExperienceStats {
        private double average;
        private int count;
    }
}