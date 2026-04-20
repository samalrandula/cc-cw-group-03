package lk.zalary.bff_service.controller;

import jakarta.validation.Valid;
import lk.zalary.bff_service.dto.*;
import lk.zalary.bff_service.service.AuthenticationService;
import lk.zalary.bff_service.service.ForwardingService;
import lk.zalary.bff_service.util.ServiceNames;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BffController {

    private final ForwardingService forwardingService;

    private final AuthenticationService authenticationService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitSalary(
            @Valid @RequestBody SalarySubmissionRequest request,
            BindingResult bindingResult
    ) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    bindingResult.getFieldErrors()
            );
        }

        return forwardingService.forward(
                request,
                ServiceNames.SALARY_SUBMISSION_SERVICE,
                HttpMethod.POST,
                "/submit",
                Object.class
        );
    }

    /**
     * Signup - Forward to Identity Service
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @Valid @RequestBody SignupRequest request,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    bindingResult.getFieldErrors()
            );
        }

        return forwardingService.forward(
                request,
                ServiceNames.IDENTITY_SERVICE,
                HttpMethod.POST,
                "/signup",
                Object.class
        );
    }

    /**
     * Login - Forward to Identity Service
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    bindingResult.getFieldErrors()
            );
        }

        return forwardingService.forward(
                request,
                ServiceNames.IDENTITY_SERVICE,
                HttpMethod.POST,
                "/login",
                Object.class
        );
    }

    /**
     * Vote on Submission - Forward to Vote Service
     */
    @PostMapping("/vote")
    public ResponseEntity<?> vote(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody VoteRequest request,
            BindingResult bindingResult
    ) {
        // Validate input
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    bindingResult.getFieldErrors()
            );
        }

        // ENFORCE AUTHENTICATION
        if (authHeader == null || authHeader.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required. Please log in to vote."));
        }

        // VALIDATE TOKEN AND GET USER_ID
        Long userId = authenticationService.validateTokenAndGetUserId(authHeader);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token. Please log in again."));
        }

        // ADD USER_ID TO REQUEST
        request.setUserId(userId);

        // FORWARD TO VOTE SERVICE
        return forwardingService.forward(
                request,
                ServiceNames.VOTE_SERVICE,
                HttpMethod.POST,
                "/vote",
                Object.class
        );
    }

    /**
     * Report submission — forward to report_service (trusted userId from JWT).
     */
    @PostMapping("/report")
    public ResponseEntity<?> report(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ReportRequest request,
            BindingResult bindingResult
    ) {
        // Validate input
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    bindingResult.getFieldErrors()
            );
        }

        // ENFORCE AUTHENTICATION
        if (authHeader == null || authHeader.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required. Please log in to report."));
        }

        // VALIDATE TOKEN AND GET USER_ID
        Long userId = authenticationService.validateTokenAndGetUserId(authHeader);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token. Please log in again."));
        }

        // ADD USER_ID TO REQUEST
        request.setUserId(userId);

        return forwardingService.forward(
                request,
                ServiceNames.REPORT_SERVICE,
                HttpMethod.POST,
                "/report",
                Object.class
        );
    }

    /**
     * Search Salaries - Forward to Search Service
     */
    @GetMapping("/search")
    public ResponseEntity<Object> searchSalaries(
            @RequestParam(required = false) List<String> countries,
            @RequestParam(required = false) List<String> companies,
            @RequestParam(required = false) List<String> roles,
            @RequestParam(required = false) List<String> levels,
            @RequestParam(required = false) BigDecimal minSalary,
            @RequestParam(required = false) BigDecimal maxSalary,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer pageSize
    ) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("countries", countries);
        requestBody.put("companies", companies);
        requestBody.put("roles", roles);
        requestBody.put("experienceLevels", levels);
        requestBody.put("salaryMin", minSalary);
        requestBody.put("salaryMax", maxSalary);
        requestBody.put("page", page);
        requestBody.put("pageSize", pageSize);

        return forwardingService.forwardWithBody(
                ServiceNames.SEARCH_SERVICE,
                "/api/v1/salaries/search",
                requestBody,
                Object.class
        );
    }



    @GetMapping("/stats")
    public ResponseEntity<?> getStats(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String experienceLevel
    ) {
        // Build query parameters map
        Map<String, String> queryParams = new HashMap<>();
        if (location != null && !location.trim().isEmpty()) {
            queryParams.put("location", location);
        }
        if (role != null && !role.trim().isEmpty()) {
            queryParams.put("role", role);
        }
        if (experienceLevel != null && !experienceLevel.trim().isEmpty()) {
            queryParams.put("experienceLevel", experienceLevel);
        }

        // FORWARD TO STATS SERVICE with query params
        return forwardingService.forwardWithParams(
                ServiceNames.STATS_SERVICE,
                "/api/stats",
                HttpMethod.GET,
                queryParams,
                Object.class
        );
    }
}