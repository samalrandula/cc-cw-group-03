package lk.zalary.search_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;
import lk.zalary.search_service.entity.Salary;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponseDTO {
    private List<SalaryResponseDTO> salaries;
    private Long totalCount;
    private Integer totalPages;
    private Integer currentPage;
    private Integer pageSize;

    public static SearchResponseDTO fromPage(Page<Salary> page) {
        List<SalaryResponseDTO> salaryDTOs = page.getContent()
                .stream()
                .map(SalaryResponseDTO::fromEntity)
                .toList();

        return SearchResponseDTO.builder()
                .salaries(salaryDTOs)
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .build();
    }
}