package lk.zalary.stats_service.model;

import jakarta.persistence.*;
import lk.zalary.stats_service.util.ExperienceLevel;
import lk.zalary.stats_service.util.SalaryStatus;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "salary_submissions")
@NoArgsConstructor
@AllArgsConstructor
public class SalarySubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "salary_submission_id")
    private Integer id;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private BigDecimal salary;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @Column(nullable = false)
    private Integer yearsOfExperience;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "experience_level", nullable = false, columnDefinition = "experience_level_enum")
    private ExperienceLevel experienceLevel;

    @Column
    private String currency;

    @Column(nullable = false)
    private Boolean anonymize = false;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "salary_status_enum")
    private SalaryStatus status = SalaryStatus.PENDING;
}