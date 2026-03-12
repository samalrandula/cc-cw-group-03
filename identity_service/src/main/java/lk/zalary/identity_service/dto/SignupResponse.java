package lk.zalary.identity_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupResponse {
    private String message;
    private Integer userId;
}

