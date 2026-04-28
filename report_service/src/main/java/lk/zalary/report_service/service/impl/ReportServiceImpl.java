package lk.zalary.report_service.service.impl;

import lk.zalary.report_service.dto.AdminRejectSubmissionRequest;
import lk.zalary.report_service.dto.ReportRequest;
import lk.zalary.report_service.dto.ReportResponse;
import lk.zalary.report_service.entity.Report;
import lk.zalary.report_service.repository.ReportRepository;
import lk.zalary.report_service.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

	private final ReportRepository reportRepository;
	private final RestTemplate restTemplate;

	@Value("${salary.submission.service.url:http://localhost:8082}")
	private String salarySubmissionServiceUrl;

	@Override
	@Transactional
	public ReportResponse submitReport(ReportRequest request) {
		int userId = request.getUserId().intValue();
		int submissionId = request.getSubmissionId().intValue();

		if (reportRepository.findByUserIdAndSalarySubmissionId(userId, submissionId).isPresent()) {
			throw new IllegalArgumentException("You have already reported this submission");
		}

		Report report = new Report();
		report.setUserId(userId);
		report.setSalarySubmissionId(submissionId);
		report.setReason(request.getReason());
		report.setCreatedAt(LocalDateTime.now());
		reportRepository.save(report);

		log.info("Report recorded for submission {} by user {}", submissionId, userId);
		return new ReportResponse("Report recorded successfully");
	}

	@Override
	public void adminRejectSubmission(AdminRejectSubmissionRequest request) {
		int submissionId = request.getSubmissionId().intValue();
		ensureSubmissionExists(submissionId);
		updateSubmissionStatus(submissionId, "ADMIN_REJECTED");
		log.info("Admin rejected salary submission {}", submissionId);
	}

	private void ensureSubmissionExists(int submissionId) {
		try {
			String url = salarySubmissionServiceUrl + "/api/submissions/" + submissionId;
			restTemplate.getForObject(url, Object.class);
		} catch (HttpClientErrorException.NotFound e) {
			throw new ResponseStatusException(
					HttpStatus.NOT_FOUND,
					"Salary submission not found with id: " + submissionId
			);
		}
	}

	private void updateSubmissionStatus(int salarySubmissionId, String status) {
		try {
			String url = salarySubmissionServiceUrl + "/api/submissions/" + salarySubmissionId + "/status?status=" + status;
			restTemplate.put(url, null);
			log.info("Updated submission {} to status {}", salarySubmissionId, status);
		} catch (Exception e) {
			log.error("Failed to update submission status", e);
		}
	}
}
