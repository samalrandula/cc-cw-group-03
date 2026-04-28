package lk.zalary.bff_service.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceImplTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authenticationService, "identityServiceUrl", "http://identity-service");
    }

    @Test
    void validateToken_nullHeader_returnsNull() {
        assertNull(authenticationService.validateTokenAndGetUserId(null));
    }

    @Test
    void validateToken_emptyHeader_returnsNull() {
        assertNull(authenticationService.validateTokenAndGetUserId(""));
    }

    @Test
    void validateToken_missingBearerPrefix_returnsNull() {
        assertNull(authenticationService.validateTokenAndGetUserId("some-token-without-bearer"));
    }

    @Test
    void validateToken_validToken_returnsUserId() {
        Map<String, Object> body = Map.of("userId", 5);
        when(restTemplate.exchange(
                eq("http://identity-service/validate-token"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(ResponseEntity.ok(body));

        Long userId = authenticationService.validateTokenAndGetUserId("Bearer valid-token");

        assertEquals(5L, userId);
    }

    @Test
    void validateToken_unauthorizedResponse_returnsNull() {
        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(new HttpClientErrorException(HttpStatus.UNAUTHORIZED));

        assertNull(authenticationService.validateTokenAndGetUserId("Bearer expired-token"));
    }

    @Test
    void validateToken_networkError_returnsNull() {
        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(new RuntimeException("Connection refused"));

        assertNull(authenticationService.validateTokenAndGetUserId("Bearer some-token"));
    }
}
