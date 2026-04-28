package lk.zalary.bff_service.controller;

import lk.zalary.bff_service.dto.*;
import lk.zalary.bff_service.service.AuthenticationService;
import lk.zalary.bff_service.service.ForwardingService;
import lk.zalary.bff_service.util.ServiceNames;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BffControllerTest {

    @Mock
    private ForwardingService forwardingService;

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private BindingResult bindingResult;

    @InjectMocks
    private BffController bffController;

    @BeforeEach
    void setUp() {
        when(bindingResult.hasErrors()).thenReturn(false);
    }

    // ── /submit ──────────────────────────────────────────────────────────

    @Test
    void submitSalary_validRequest_returnsOk() {
        SalarySubmissionRequest request = new SalarySubmissionRequest();
        when(forwardingService.forward(any(), eq(ServiceNames.SALARY_SUBMISSION_SERVICE), eq(HttpMethod.POST), eq("/submit"), eq(Object.class)))
                .thenReturn(ResponseEntity.ok("submitted"));

        ResponseEntity<?> response = bffController.submitSalary(request, bindingResult);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void submitSalary_validationErrors_returnsBadRequest() {
        when(bindingResult.hasErrors()).thenReturn(true);
        when(bindingResult.getFieldErrors()).thenReturn(List.of());

        ResponseEntity<?> response = bffController.submitSalary(new SalarySubmissionRequest(), bindingResult);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    // ── /login ───────────────────────────────────────────────────────────

    @Test
    void login_validRequest_returnsOk() {
        LoginRequest request = new LoginRequest();
        when(forwardingService.forward(any(), eq(ServiceNames.IDENTITY_SERVICE), eq(HttpMethod.POST), eq("/login"), eq(Object.class)))
                .thenReturn(ResponseEntity.ok("token"));

        ResponseEntity<?> response = bffController.login(request, bindingResult);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void login_validationErrors_returnsBadRequest() {
        when(bindingResult.hasErrors()).thenReturn(true);
        when(bindingResult.getFieldErrors()).thenReturn(List.of());

        ResponseEntity<?> response = bffController.login(new LoginRequest(), bindingResult);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    // ── /signup ──────────────────────────────────────────────────────────

    @Test
    void signup_validRequest_returnsCreated() {
        SignupRequest request = new SignupRequest();
        when(forwardingService.forward(any(), eq(ServiceNames.IDENTITY_SERVICE), eq(HttpMethod.POST), eq("/signup"), eq(Object.class)))
                .thenReturn(ResponseEntity.status(HttpStatus.CREATED).body("created"));

        ResponseEntity<?> response = bffController.signup(request, bindingResult);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    // ── /vote ────────────────────────────────────────────────────────────

    @Test
    void vote_noAuthHeader_returnsUnauthorized() {
        ResponseEntity<?> response = bffController.vote(null, new VoteRequest(), bindingResult);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void vote_invalidToken_returnsUnauthorized() {
        when(authenticationService.validateTokenAndGetUserId("Bearer bad")).thenReturn(null);

        ResponseEntity<?> response = bffController.vote("Bearer bad", new VoteRequest(), bindingResult);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void vote_validToken_returnsOk() {
        when(authenticationService.validateTokenAndGetUserId("Bearer good")).thenReturn(1L);
        when(forwardingService.forward(any(), eq(ServiceNames.VOTE_SERVICE), eq(HttpMethod.POST), eq("/api/vote"), eq(Object.class)))
                .thenReturn(ResponseEntity.ok("voted"));

        VoteRequest request = new VoteRequest();
        ResponseEntity<?> response = bffController.vote("Bearer good", request, bindingResult);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1L, request.getUserId());
    }

    // ── /report ──────────────────────────────────────────────────────────

    @Test
    void report_noAuthHeader_returnsUnauthorized() {
        ResponseEntity<?> response = bffController.report(null, new ReportRequest(), bindingResult);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void report_validToken_returnsOk() {
        when(authenticationService.validateTokenAndGetUserId("Bearer good")).thenReturn(1L);
        when(forwardingService.forward(any(), eq(ServiceNames.REPORT_SERVICE), eq(HttpMethod.POST), eq("/report"), eq(Object.class)))
                .thenReturn(ResponseEntity.ok("reported"));

        ResponseEntity<?> response = bffController.report("Bearer good", new ReportRequest(), bindingResult);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    // ── /search ──────────────────────────────────────────────────────────

    @Test
    void search_noParams_returnsOk() {
        when(forwardingService.forwardWithBody(eq(ServiceNames.SEARCH_SERVICE), eq("/api/v1/salaries/search"), any(), eq(Object.class)))
                .thenReturn(ResponseEntity.ok("results"));

        ResponseEntity<Object> response = bffController.searchSalaries(null, null, null, null, null, null, 0, 20);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
