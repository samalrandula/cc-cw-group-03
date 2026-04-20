package lk.zalary.salary_submission_service.service.impl;

import lk.zalary.salary_submission_service.dto.SalarySubmissionRequest;
import lk.zalary.salary_submission_service.entity.SalarySubmissions;
import lk.zalary.salary_submission_service.repository.SalaryRepository;
import lk.zalary.salary_submission_service.service.SalaryService;
import lk.zalary.salary_submission_service.util.SalaryStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalaryServiceImpl implements SalaryService {

    private final SalaryRepository salaryRepository;

    private final Random random = new Random();

    @Override
    public int save(SalarySubmissionRequest request) {

        //  Normalize input
        String country = request.getCountry().trim();
        String company = request.getCompany().trim();
        String role = request.getRole().trim();

        // Optional anonymization: round salary to nearest 1000
        BigDecimal salary = request.getSalary()
                .setScale(-3, RoundingMode.HALF_UP);

        // Create SalarySubmission object
        SalarySubmissions submission = new SalarySubmissions();
        submission.setCountry(country);
        submission.setCompany(company);
        submission.setRole(role);
        submission.setExperienceLevel(request.getExperienceLevel());
        submission.setYearsOfExperience(request.getYearsOfExperience());
        submission.setSalary(salary);
        submission.setCurrency(request.getCurrency());
        submission.setAnonymize(request.getAnonymize());
        submission.setSubmittedAt(LocalDateTime.now());

        SalarySubmissions savedSubmission = salaryRepository.save(submission);

        // Log submission for testing
        log.info("Salary Submission received: {}", submission);
        return savedSubmission.getId();
    }

    @Override
    public void updateStatus(Integer salarySubmissionId, SalaryStatus status) {
        SalarySubmissions submission = salaryRepository.findById(salarySubmissionId.longValue())
                .orElseThrow(() -> new IllegalArgumentException("Salary submission not found with id: " + salarySubmissionId));

        if (submission.getStatus() == SalaryStatus.ADMIN_REJECTED && status != SalaryStatus.ADMIN_REJECTED) {
            log.warn("Ignoring status change for submission {} to {} — ADMIN_REJECTED is final", salarySubmissionId, status);
            return;
        }

        submission.setStatus(status);
        salaryRepository.save(submission);
        
        log.info("Updated salary submission {} to status {}", salarySubmissionId, status);
    }

    @Override
    public SalarySubmissions getById(Integer salarySubmissionId) {
        log.info("Retrieving salary submission with id: {}", salarySubmissionId);
        return salaryRepository.findById(salarySubmissionId.longValue())
                .orElseThrow(() -> new IllegalArgumentException("Salary submission not found with id: " + salarySubmissionId));
    }
}
