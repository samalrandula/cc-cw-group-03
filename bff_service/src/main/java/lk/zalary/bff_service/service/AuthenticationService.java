package lk.zalary.bff_service.service;

public interface AuthenticationService {

    /**
     * Validates JWT token by calling Identity Service
     * and extracts user ID
     *
     * @param authorizationHeader - Authorization header with "Bearer <token>"
     * @return userId if token is valid, null if invalid
     */
    Long validateTokenAndGetUserId(String authorizationHeader);
}