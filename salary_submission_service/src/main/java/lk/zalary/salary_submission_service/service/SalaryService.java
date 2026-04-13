package lk.zalary.salary_submission_service.service;

import jakarta.validation.Valid;
import lk.zalary.salary_submission_service.dto.SalarySubmissionRequest;
import lk.zalary.salary_submission_service.entity.SalarySubmissions;
import lk.zalary.salary_submission_service.util.SalaryStatus;

public interface SalaryService {
    public int save(@Valid SalarySubmissionRequest request);
    public void updateStatus(Integer salarySubmissionId, SalaryStatus status);
    public SalarySubmissions getById(Integer salarySubmissionId);
}
