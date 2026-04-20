package lk.zalary.report_service.controller;

import jakarta.validation.Valid;
import lk.zalary.report_service.dto.AdminRejectSubmissionRequest;
import lk.zalary.report_service.dto.ReportRequest;
import lk.zalary.report_service.dto.ReportResponse;
import lk.zalary.report_service.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReportController {

	private final ReportService reportService;

	@PostMapping("/report")
	public ResponseEntity<ReportResponse> submitReport(@Valid @RequestBody ReportRequest request) {
		try {
			ReportResponse response = reportService.submitReport(request);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
					new ReportResponse(e.getMessage())
			);
		}
	}

	/**
	 * Assumed to be called only via a trusted admin-protected path (e.g. BFF / API gateway).
	 */
	@PostMapping("/admin/reject-submission")
	public ResponseEntity<?> adminRejectSubmission(@Valid @RequestBody AdminRejectSubmissionRequest request) {
		reportService.adminRejectSubmission(request);
		return ResponseEntity.ok(Map.of(
				"message", "Submission rejected",
				"submissionId", request.getSubmissionId()
		));
	}
}
