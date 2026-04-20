package lk.zalary.report_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Trusted caller (e.g. BFF) supplies userId after token validation.
 */
@Data
public class ReportRequest {

	@NotNull(message = "User ID is required")
	private Long userId;

	@NotNull(message = "Submission ID is required")
	private Long submissionId;

	private String reason;
}
