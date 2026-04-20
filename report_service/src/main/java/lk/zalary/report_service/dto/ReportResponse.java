package lk.zalary.report_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReportResponse {
	private String message;
	private long reportCount;
	/** True when total reports for this submission reached the flag threshold (submission set to FLAGGED). */
	private boolean submissionFlagged;
}
