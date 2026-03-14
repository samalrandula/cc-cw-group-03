package lk.zalary.search_service.dto;

import lk.zalary.search_service.entity.ExperienceLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchRequestDTO {

    private List<String> countries;
    private List<String> companies;
    private List<String> roles;
    private List<ExperienceLevel> experienceLevels;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;

    // Pagination
    private Integer page = 0;
    private Integer pageSize = 20;
}