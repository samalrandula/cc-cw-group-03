package lk.zalary.vote_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

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
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Boolean isValid = (Boolean) body.get("valid");
                
                if (Boolean.TRUE.equals(isValid)) {
                    return (Integer) body.get("userId");
                }
            }
            
            throw new RuntimeException("Invalid token");
            
        } catch (Exception e) {
            log.error("Token validation failed", e);
            throw new RuntimeException("Token validation failed: " + e.getMessage());
        }
    }
}
