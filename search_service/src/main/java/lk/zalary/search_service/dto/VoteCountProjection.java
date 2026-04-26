package lk.zalary.search_service.dto;

public interface VoteCountProjection {
    Integer getSalaryId();
    Long getUpvoteCount();
    Long getDownvoteCount();
}
