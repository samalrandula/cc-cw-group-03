package lk.zalary.report_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "report_id")
	private Integer reportId;

	@Column(name = "user_id", nullable = false)
	private Integer userId;

	@Column(name = "salary_submission_id", nullable = false)
	private Integer salarySubmissionId;

	@Column(name = "reason", columnDefinition = "TEXT")
	private String reason;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
}
