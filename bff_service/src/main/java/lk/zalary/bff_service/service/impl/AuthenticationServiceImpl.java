package lk.zalary.bff_service.service.impl;

import lk.zalary.bff_service.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final RestTemplate restTemplate;

    @Value("${identity.service.url}")
    private String identityServiceUrl;

    /**
     * Validates JWT token by calling Identity Service
     * Returns user_id if valid, null if invalid
     *
     * Flow:
     * 1. Extract token from Authorization header
     * 2. Call Identity Service /api/auth/validate-token
     * 3. Identity Service validates signature, expiration, format
     * 4. Identity Service returns userId if valid
     * 5. BFF extracts and returns userId
     */
    @Override
    public Long validateTokenAndGetUserId(String authorizationHeader) {

        // STEP 1: Check if Authorization header exists
        if (authorizationHeader == null || authorizationHeader.isEmpty()) {
            System.err.println("Authorization header is missing");
            return null;
        }

        // STEP 2: Check if header starts with "Bearer "
        if (!authorizationHeader.startsWith("Bearer ")) {
            System.err.println("Invalid authorization header format. Expected 'Bearer <token>'");
            return null;
        }

        // STEP 3: Extract token (remove "Bearer " prefix)
        String token = authorizationHeader.substring(7); // "Bearer " is 7 characters

        System.out.println("Validating token with Identity Service...");

        try {
            // STEP 4: Call Identity Service to validate token
            String url = identityServiceUrl + "/validate-token";

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            // Make request to Identity Service
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            // STEP 5: Extract user_id from response
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object userIdObj = response.getBody().get("userId");

                if (userIdObj instanceof Integer) {
                    Long userId = ((Integer) userIdObj).longValue();
                    System.out.println("Token validated successfully for userId: " + userId);
                    return userId;
                } else if (userIdObj instanceof Long) {
                    Long userId = (Long) userIdObj;
                    System.out.println("Token validated successfully for userId: " + userId);
                    return userId;
                } else {
                    System.err.println("Invalid userId format in response: " + userIdObj);
                    return null;
                }
            }

            System.err.println("Token validation failed: Invalid response from Identity Service");
            return null;

        } catch (HttpClientErrorException e) {
            // Token is invalid (401, 403, etc.)
            System.err.println("Token validation failed with status: " + e.getStatusCode());
            System.err.println("Response body: " + e.getResponseBodyAsString());
            return null;

        } catch (Exception e) {
            // Other errors (network, timeout, etc.)
            System.err.println("Error validating token: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}