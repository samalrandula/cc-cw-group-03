package lk.zalary.identity_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenValidationResponse {
    private boolean valid;
    private Integer userId;
}

