package lk.zalary.bff_service.service;

import lk.zalary.bff_service.util.ServiceNames;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface ForwardingService {
    public <T, R> ResponseEntity<Object> forward(
            T requestBody,
            ServiceNames serviceNames,
            HttpMethod method,
            String path,
            Class<R> responseType
    );

    <R> ResponseEntity<Object> forwardWithParams(
            ServiceNames serviceNames,
            String path,
            HttpMethod method,
            Map<String, String> queryParams,
            Class<R> responseType
    );

    // NEW METHOD
    <R> ResponseEntity<Object> forwardWithBody(
            ServiceNames serviceNames,
            String path,
            Map<String, Object> requestBody,
            Class<R> responseType
    );
}
