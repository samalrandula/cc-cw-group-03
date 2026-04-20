package lk.zalary.stats_service.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CurrencyService {

    private final Map<String, BigDecimal> rateCache = new ConcurrentHashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String API_URL = "https://open.er-api.com/v6/latest/USD";

    public BigDecimal convertToUSD(BigDecimal amount, String fromCurrency) {
        if (fromCurrency == null || "USD".equalsIgnoreCase(fromCurrency)) {
            return amount;
        }
        if (rateCache.isEmpty()) {
            synchronized (this) {
                if (rateCache.isEmpty()) {
                    refreshRates();
                }
            }
        }

        BigDecimal rateOfCurrencyPerUSD = rateCache.get(fromCurrency.toUpperCase());

        if (rateOfCurrencyPerUSD == null) {
            throw new RuntimeException("Currency code not supported: " + fromCurrency);
        }

        return amount.divide(rateOfCurrencyPerUSD, 4, RoundingMode.HALF_UP);
    }

    @Scheduled(cron = "0 0 1 * * ?") 
    public void clearCache() {
        rateCache.clear();
    }

    private void refreshRates() {
        try {
            Map<String, Object> response = restTemplate.getForObject(API_URL, Map.class);
            if (response != null && "success".equals(response.get("result"))) {
                Map<String, Object> rates = (Map<String, Object>) response.get("rates");
                rates.forEach((key, value) -> rateCache.put(key, new BigDecimal(value.toString())));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch rates: " + e.getMessage());
        }
    }
}