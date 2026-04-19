package lk.zalary.search_service.service;

import lk.zalary.search_service.client.VoteServiceClient;
import lk.zalary.search_service.dto.SearchRequestDTO;
import lk.zalary.search_service.dto.SearchResponseDTO;
import lk.zalary.search_service.dto.SalaryResponseDTO;
import lk.zalary.search_service.dto.VoteCountResponse;
import lk.zalary.search_service.entity.Salary;
import lk.zalary.search_service.repository.SalaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SearchService {

    private final SalaryRepository salaryRepository;
    private final VoteServiceClient voteServiceClient;

    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 20;

    public SearchResponseDTO searchSalaries(SearchRequestDTO request) {
        log.info("Searching salaries with filters - countries: {}, companies: {}, roles: {}, levels: {}",
                request.getCountries(), request.getCompanies(), request.getRoles(), request.getExperienceLevels());

        int page = Math.max(0, request.getPage() != null ? request.getPage() : 0);
        int size = Math.min(
                request.getPageSize() != null ? request.getPageSize() : DEFAULT_PAGE_SIZE,
                MAX_PAGE_SIZE
        );

        Pageable pageable = PageRequest.of(page, size, Sort.by("salary").descending());

        Page<Salary> results = salaryRepository.searchSalaries(
                request.getCountries(),
                request.getCompanies(),
                request.getRoles(),
                request.getExperienceLevels(),
                request.getSalaryMin(),
                request.getSalaryMax(),
                pageable
        );

        log.info("Found {} salaries matching filters", results.getTotalElements());

        SearchResponseDTO response = SearchResponseDTO.fromPage(results);
        response.getSalaries().forEach(this::enrichWithVoteCounts);
        return response;
    }

    public List<String> getCountries() {
        log.debug("Fetching distinct countries");
        return salaryRepository.findDistinctCountries();
    }

    public List<String> getCompanies() {
        log.debug("Fetching distinct companies");
        return salaryRepository.findDistinctCompanies();
    }

    public List<String> getRoles() {
        log.debug("Fetching distinct roles");
        return salaryRepository.findDistinctRoles();
    }

    public List<String> getExperienceLevels() {
        log.debug("Fetching distinct experience levels");
        return salaryRepository.findDistinctExperienceLevels()
                .stream()
                .map(Enum::name)
                .toList();
    }

    public SalaryResponseDTO getSalaryById(Integer id) {
        log.info("Fetching salary with ID: {}", id);
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Salary not found with ID: " + id));
        SalaryResponseDTO dto = SalaryResponseDTO.fromEntity(salary);
        enrichWithVoteCounts(dto);
        return dto;
    }

    private void enrichWithVoteCounts(SalaryResponseDTO dto) {
        VoteCountResponse votes = voteServiceClient.getVoteCounts(dto.getId());
        dto.setUpvoteCount(votes.getUpvoteCount());
        dto.setDownvoteCount(votes.getDownvoteCount());
    }
}