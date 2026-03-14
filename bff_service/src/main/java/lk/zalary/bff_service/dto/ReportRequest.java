package lk.zalary.bff_service.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class ReportRequest {

    @NotNull(message = "Submission ID is required")
    private Long submissionId;

    private String reason;

    // This field is set by BFF after token validation
    // NOT sent by frontend
    private Long userId;
}