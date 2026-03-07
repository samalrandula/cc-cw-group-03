package lk.zalary.stats_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatsResponse {

    private double averageSalary;
    private double medianSalary;
    private int count;
}