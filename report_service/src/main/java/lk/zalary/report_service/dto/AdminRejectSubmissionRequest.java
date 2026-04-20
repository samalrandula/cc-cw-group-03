package lk.zalary.report_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminRejectSubmissionRequest {

	@NotNull(message = "Submission ID is required")
	private Long submissionId;
}
