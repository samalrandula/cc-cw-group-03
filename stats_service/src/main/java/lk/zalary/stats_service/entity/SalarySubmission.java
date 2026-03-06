package lk.zalary.stats_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions", schema = "salary")
public class SalarySubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String company;
    private String role;
    private String country;
    private String experienceLevel;
    private Double salaryAmount;
    private Boolean isApproved;
    private LocalDateTime createdAt;

    // getters and setters
}