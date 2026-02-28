package lk.zalary.salary_submission_service.service;

import jakarta.validation.Valid;
import lk.zalary.salary_submission_service.dto.SalarySubmissionRequest;

public interface SalaryService {
    public int save(@Valid SalarySubmissionRequest request);
}
