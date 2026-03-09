package lk.zalary.search_service.entity;

public enum SalaryStatus {
    PENDING("Pending approval from community votes"),
    APPROVED("Approved by community votes");

    private final String description;

    SalaryStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}