package lk.zalary.search_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "salary_submissions")
@NoArgsConstructor
@AllArgsConstructor
public class Salary {

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
    @Column(name = "experience_level", nullable = false, columnDefinition = "experience_level")
    private ExperienceLevel experienceLevel;

    @Column
    private String currency;

    @Column(nullable = false)
    private Boolean anonymize = false;
}