package lk.zalary.search_service.controller;

import lk.zalary.search_service.dto.SearchRequestDTO;
import lk.zalary.search_service.dto.SearchResponseDTO;
import lk.zalary.search_service.dto.SalaryResponseDTO;
import lk.zalary.search_service.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/salaries")
@RequiredArgsConstructor
@Slf4j
public class SearchController {

    private final SearchService searchService;

    @PostMapping("/search")
    public ResponseEntity<SearchResponseDTO> searchSalaries(@RequestBody SearchRequestDTO request) {
        log.info("Received search request");
        SearchResponseDTO response = searchService.searchSalaries(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalaryResponseDTO> getSalaryById(@PathVariable Integer id) {
        log.info("Fetching salary by ID: {}", id);
        SalaryResponseDTO salary = searchService.getSalaryById(id);
        return ResponseEntity.ok(salary);
    }

    @GetMapping("/filters/countries")
    public ResponseEntity<Map<String, List<String>>> getCountries() {
        log.debug("Fetching distinct countries");
        List<String> countries = searchService.getCountries();
        return ResponseEntity.ok(Map.of("countries", countries));
    }

    @GetMapping("/filters/companies")
    public ResponseEntity<Map<String, List<String>>> getCompanies() {
        log.debug("Fetching distinct companies");
        List<String> companies = searchService.getCompanies();
        return ResponseEntity.ok(Map.of("companies", companies));
    }

    @GetMapping("/filters/roles")
    public ResponseEntity<Map<String, List<String>>> getRoles() {
        log.debug("Fetching distinct roles");
        List<String> roles = searchService.getRoles();
        return ResponseEntity.ok(Map.of("roles", roles));
    }

    @GetMapping("/filters/experience-levels")
    public ResponseEntity<Map<String, List<String>>> getExperienceLevels() {
        log.debug("Fetching distinct experience levels");
        List<String> levels = searchService.getExperienceLevels();
        return ResponseEntity.ok(Map.of("experienceLevels", levels));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "Search service is running"
        ));
    }
}