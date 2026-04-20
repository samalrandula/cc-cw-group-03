package lk.zalary.report_service.service;

import lk.zalary.report_service.dto.AdminRejectSubmissionRequest;
import lk.zalary.report_service.dto.ReportRequest;
import lk.zalary.report_service.dto.ReportResponse;

public interface ReportService {

	ReportResponse submitReport(ReportRequest request);

	void adminRejectSubmission(AdminRejectSubmissionRequest request);
}
