package lk.zalary.vote_service.service;

import lk.zalary.vote_service.dto.TokenValidationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final RestTemplate restTemplate;
    
    @Value("${identity.service.url}")
    private String identityServiceUrl;
    
    public Integer validateTokenAndGetUserId(String token) {
        try {
            String url = identityServiceUrl + "/validate-token";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + token);
            
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            
            ResponseEntity<TokenValidationResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                TokenValidationResponse.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                TokenValidationResponse body = response.getBody();
                
                if (body.isValid()) {
                    return body.getUserId();
                }
            }
            
            throw new RuntimeException("Invalid token");
            
        } catch (Exception e) {
            log.error("Token validation failed", e);
            throw new RuntimeException("Token validation failed: " + e.getMessage());
        }
    }
}
