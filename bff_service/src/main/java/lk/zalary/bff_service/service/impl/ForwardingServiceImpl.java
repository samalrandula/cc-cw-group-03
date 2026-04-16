package lk.zalary.bff_service.service.impl;

import lk.zalary.bff_service.service.ForwardingService;
import lk.zalary.bff_service.util.ServiceNames;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ForwardingServiceImpl implements ForwardingService {

    private final RestTemplate restTemplate;

    @Value("${salary.submission.service.url}")
    private String salaryServiceUrl;

    @Value("${identity.service.url}")
    private String identityServiceUrl;

    @Value("${vote.service.url}")
    private String voteServiceUrl;

    @Value("${search.service.url}")
    private String searchServiceUrl;

    @Value("${stats.service.url}")
    private String statsServiceUrl;

    /**
     * Forward request with body (POST/PUT requests)
     */
    @Override
    public <T, R> ResponseEntity<Object> forward(
            T requestBody,
            ServiceNames serviceNames,
            HttpMethod method,
            String path,
            Class<R> responseType
    ) {

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<T> entity = requestBody != null
                    ? new HttpEntity<>(requestBody, headers)
                    : new HttpEntity<>(headers);

            ResponseEntity<R> response = restTemplate.exchange(
                    getUrl(serviceNames) + path,
                    method,
                    entity,
                    responseType
            );

            return ResponseEntity
                    .status(response.getStatusCode())
                    .body(response.getBody());

        } catch (HttpClientErrorException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(ex.getResponseBodyAsString());
        }
    }

    /**
     * Forward request with query parameters (GET requests)
     */
    @Override
    public <R> ResponseEntity<Object> forwardWithParams(
            ServiceNames serviceNames,
            String path,
            HttpMethod method,
            Map<String, String> queryParams,
            Class<R> responseType
    ) {

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Build URL with query parameters
            String baseUrl = getUrl(serviceNames) + path;
            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(baseUrl);

            // Add query parameters if present
            if (queryParams != null && !queryParams.isEmpty()) {
                queryParams.forEach(uriBuilder::queryParam);
            }

            String url = uriBuilder.toUriString();

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<R> response = restTemplate.exchange(
                    url,
                    method,
                    entity,
                    responseType
            );

            return ResponseEntity
                    .status(response.getStatusCode())
                    .body(response.getBody());

        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Forward request with JSON body (convenience method for POST)
     */
    @Override
    public <R> ResponseEntity<Object> forwardWithBody(
            ServiceNames serviceNames,
            String path,
            Map<String, Object> requestBody,
            Class<R> responseType
    ) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<R> response = restTemplate.exchange(
                    getUrl(serviceNames) + path,
                    HttpMethod.POST,
                    entity,
                    responseType
            );

            return ResponseEntity
                    .status(response.getStatusCode())
                    .body(response.getBody());

        } catch (HttpClientErrorException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(ex.getResponseBodyAsString());
        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Service unavailable", "message", ex.getMessage()));
        }
    }

    /**
     * Get service URL based on service name
     */
    private String getUrl(ServiceNames serviceNames) {
        return switch (serviceNames) {
            case SALARY_SUBMISSION_SERVICE -> salaryServiceUrl;
            case IDENTITY_SERVICE -> identityServiceUrl;
            case VOTE_SERVICE -> voteServiceUrl;
            case SEARCH_SERVICE -> searchServiceUrl;
            case STATS_SERVICE -> statsServiceUrl;
            default -> "";
        };
    }
}