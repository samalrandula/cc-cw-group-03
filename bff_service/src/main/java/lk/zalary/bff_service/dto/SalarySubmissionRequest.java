package lk.zalary.bff_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalarySubmissionRequest {

    @NotBlank
    private String company;

    @NotBlank
    private String country;

    @NotBlank
    private String role;

    @NotNull
    private BigDecimal salary;

    @NotNull
    private Integer yearsOfExperience;

    @NotNull
    private String experienceLevel;

    private String currency;

    private Boolean anonymize;
}