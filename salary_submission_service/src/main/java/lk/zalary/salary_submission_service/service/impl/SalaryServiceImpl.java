package lk.zalary.salary_submission_service.service.impl;

import lk.zalary.salary_submission_service.dto.SalarySubmissionRequest;
import lk.zalary.salary_submission_service.entity.Salary;
import lk.zalary.salary_submission_service.repository.SalaryRepository;
import lk.zalary.salary_submission_service.service.SalaryService;
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
        Salary submission = new Salary();
        submission.setCountry(country);
        submission.setCompany(company);
        submission.setRole(role);
        submission.setExperienceLevel(request.getExperienceLevel());
        submission.setYearsOfExperience(request.getYearsOfExperience());
        submission.setSalary(salary);
        submission.setCurrency(request.getCurrency());
        submission.setAnonymize(request.getAnonymize());
        submission.setSubmittedAt(LocalDateTime.now());

        Salary savedSubmission = salaryRepository.save(submission);

        // Log submission for testing
        log.info("Salary Submission received: {}", submission);
        return savedSubmission.getId();
    }
}
