package lk.zalary.vote_service.entity;

import jakarta.persistence.*;
import lk.zalary.vote_service.util.VoteType;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "votes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vote {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vote_id")
    private Integer voteId;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "salary_submission_id", nullable = false)
    private Integer salarySubmissionId;
    
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "vote_type", nullable = false, columnDefinition = "vote_type")
    private VoteType voteType;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
