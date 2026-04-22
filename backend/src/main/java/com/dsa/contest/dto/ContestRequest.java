package com.dsa.contest.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ContestRequest {
    @NotBlank
    private String name;
    @Positive
    private long duration; // in minutes
    private Instant startTime; // optional, if provided, contest is scheduled
    @Builder.Default
    private boolean manualStart = true; // true for manual start, false for scheduled
}
