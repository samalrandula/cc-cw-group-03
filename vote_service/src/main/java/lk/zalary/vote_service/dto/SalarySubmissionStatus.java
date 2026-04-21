package lk.zalary.vote_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Minimal shape for GET /api/submissions/{id} — only status is read.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SalarySubmissionStatus {
	private String status;
}
