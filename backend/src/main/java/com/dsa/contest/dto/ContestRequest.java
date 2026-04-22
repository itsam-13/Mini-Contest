package com.dsa.contest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ContestRequest {
    @NotBlank
    private String name;
    @Positive
    private long duration; // in minutes
}
