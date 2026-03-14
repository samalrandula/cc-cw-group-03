package lk.zalary.bff_service.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}