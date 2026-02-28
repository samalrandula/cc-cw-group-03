package lk.zalary.salary_submission_service.dto;

import jakarta.validation.constraints.*;
import lk.zalary.salary_submission_service.util.ExperienceLevel;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalarySubmissionRequest {

    @NotBlank(message = "Company is required")
    private String company;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "Role is required")
    private String role;

    @NotNull(message = "Salary is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Salary must be positive")
    private BigDecimal salary;

    private java.time.LocalDateTime submittedAt;

    @NotNull(message = "Years of experience is required")
    @Min(value = 0, message = "Years of experience must be 0 or more")
    private Integer yearsOfExperience;

    private String currency;

    @NotNull(message = "Experience level is required")
    private ExperienceLevel experienceLevel;

    private Boolean anonymize = false;
}