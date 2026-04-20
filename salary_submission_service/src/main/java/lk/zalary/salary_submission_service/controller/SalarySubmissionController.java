package lk.zalary.salary_submission_service.controller;

import jakarta.validation.Valid;
import lk.zalary.salary_submission_service.dto.SalarySubmissionRequest;
import lk.zalary.salary_submission_service.service.SalaryService;
import lk.zalary.salary_submission_service.util.SalaryStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class SalarySubmissionController {

    private final SalaryService salaryService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitSalary(
            @Valid @RequestBody SalarySubmissionRequest request,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            // Collect all field errors
            List<String> errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("status", 400);
            response.put("error", "Validation failed");
            response.put("details", errors);

            return ResponseEntity.badRequest().body(response);
        }

        // save submission
        int id = salaryService.save(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", id, "message", "Submission successful"));
    }

    @GetMapping("/api/submissions/{id}")
    public ResponseEntity<?> getSubmission(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(salaryService.getById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/api/submissions/{id}/status")
    public ResponseEntity<?> updateSubmissionStatus(
            @PathVariable Integer id,
            @RequestParam String status
    ) {
        try {
            SalaryStatus salaryStatus = SalaryStatus.valueOf(status.toUpperCase());
            salaryService.updateStatus(id, salaryStatus);
            
            return ResponseEntity.ok(Map.of(
                "message", "Status updated successfully",
                "submissionId", id,
                "status", salaryStatus
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}