package lk.zalary.stats_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="submissions", schema="salary")
public class SalarySubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String company;

    private String role;

    private String country;

    private Integer experience;

    private Integer salary;

    private String status;
}