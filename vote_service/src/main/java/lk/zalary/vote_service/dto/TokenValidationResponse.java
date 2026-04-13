package lk.zalary.vote_service.dto;

import lombok.Data;

@Data
public class TokenValidationResponse {
    private boolean valid;
    private Integer userId;
}
