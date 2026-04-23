package lk.zalary.search_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lk.zalary.search_service.entity.Salary;
import lk.zalary.search_service.entity.ExperienceLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryResponseDTO {
    private Integer id;
    private String company;
    private String country;
    private String role;
    private BigDecimal salary;
    private String currency;
    private ExperienceLevel experienceLevel;
    private Integer yearsOfExperience;

    @JsonProperty("isAnonymized")
    private Boolean anonymize;

    private LocalDateTime submittedAt;

    @Builder.Default
    private Long upvoteCount = 0L;
    @Builder.Default
    private Long downvoteCount = 0L;

    public static SalaryResponseDTO fromEntity(Salary salary) {
        return SalaryResponseDTO.builder()
                .id(salary.getId())
                // If anonymize = true, show "Anonymous", else show actual company
                .company(salary.getAnonymize() ? "Anonymous" : salary.getCompany())
                .country(salary.getCountry())
                .role(salary.getRole())
                .salary(salary.getSalary())
                .currency(salary.getCurrency())
                .experienceLevel(salary.getExperienceLevel())
                .yearsOfExperience(salary.getYearsOfExperience())
                .anonymize(salary.getAnonymize())
                .submittedAt(salary.getSubmittedAt())
                .build();
    }
}