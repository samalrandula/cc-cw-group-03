package lk.zalary.vote_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "votes", schema = "zalary")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vote {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "vote_id")
    private UUID voteId;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "submission_id", nullable = false)
    private Integer submissionId;
    
    @Column(name = "vote_type", nullable = false)
    private String voteType;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
